import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';
import { useToast } from '@/hooks/use-toast';

interface HtmlResponseModalProps {
  html: string;
  onClose: () => void;
}

export function HtmlResponseModal({ html, onClose }: HtmlResponseModalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = html;
    }
  }, [html]);

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = containerRef.current;
      const opt = {
        margin: 10,
        filename: 'analyse-image.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Générer et télécharger directement le PDF
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Succès",
        description: "Le PDF a été généré et téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl">
        <Card className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Résultat de l'analyse</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'Génération...' : 'Télécharger en PDF'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            ref={containerRef}
            className="html-content p-6"
          />
        </Card>
      </div>
    </div>
  );
}
