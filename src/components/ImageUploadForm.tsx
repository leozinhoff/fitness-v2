import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface FormInputs {
  image: FileList;
}

export function ImageUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch } = useForm<FormInputs>();

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Success!",
        description: "Your image has been uploaded successfully.",
      });

      // Reset preview
      setPreview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Upload Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Choose an image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              {...register('image', { required: true })}
              className="cursor-pointer"
            />
          </div>

          {preview && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={preview}
                alt="Preview"
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
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
