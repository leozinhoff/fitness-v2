import { ImageUploadForm } from '@/components/ImageUploadForm';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Image Upload</h1>
          <p className="text-muted-foreground">
            Upload your images securely to Supabase storage
          </p>
        </div>
        
        <ImageUploadForm />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
