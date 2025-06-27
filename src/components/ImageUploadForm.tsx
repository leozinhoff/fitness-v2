import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HtmlResponseModal } from './HtmlResponseModal';

interface FormInputs {
  image: FileList;
}

interface WebhookResponse {
  html: string;
}

// Webhook URL - Replace with your n8n webhook URL
const WEBHOOK_URL = 'https://n8n.vps.digeez.fr/webhook/644ba8a5-99b1-45ad-91e0-a5efee9deb39';

export function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [responseHtml, setResponseHtml] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, watch, reset } = useForm<FormInputs>();

  // Watch for file changes to create preview
  const selectedFile = watch('image');
  if (selectedFile?.[0] && !preview) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile[0]);
  }

  const onSubmit = async (data: FormInputs) => {
    if (!data.image?.[0]) return;

    setIsUploading(true);
    try {
      const file = data.image[0];
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result: WebhookResponse = await response.json();
      
      // Vérifier si la réponse contient la propriété html
      if (result.html) {
        setResponseHtml(result.html);
        toast({
          title: "Succès !",
          description: "Votre image a été analysée avec succès.",
        });
      } else {
        throw new Error('Invalid response format');
      }

      // Reset form and preview
      reset();
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'analyse de l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Télécharger une image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Choisissez une image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                {...register('image', { required: true })}
                className="cursor-pointer"
                onChange={(e) => {
                  register('image').onChange(e);
                  // Reset preview when new file is selected
                  setPreview(null);
                }}
              />
            </div>

            {preview && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || !selectedFile?.[0]}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyser l'image
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {responseHtml && (
        <HtmlResponseModal
          html={responseHtml}
          onClose={() => setResponseHtml(null)}
        />
      )}
    </>
  );
}
