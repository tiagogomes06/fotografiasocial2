import { useState } from "react";
import { Button } from "./ui/button";
import { Download, ShoppingBag, X } from "lucide-react";
import { downloadSinglePhoto, downloadAllPhotos } from "@/utils/downloadUtils";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoGalleryProps {
  photos: string[];
  studentName: string;
}

const PhotoGallery = ({ photos, studentName }: PhotoGalleryProps) => {
  const navigate = useNavigate();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const handleSingleDownload = (photoUrl: string, index: number) => {
    downloadSinglePhoto(photoUrl, `${studentName}_foto_${index + 1}.jpg`);
  };

  const handleAllDownload = () => {
    downloadAllPhotos(photos, studentName);
  };

  const goToStore = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast.error("Por favor, volte à página inicial e acesse suas fotos novamente");
      navigate('/');
      return;
    }
    navigate('/store', { state: { photos, studentName, studentId } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Fotos de {studentName}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAllDownload} 
                variant="outline" 
                className="w-full sm:w-auto hover:bg-gray-100"
              >
                <Download className="mr-2 h-4 w-4" />
                Transferir Todas
              </Button>
              <Button 
                onClick={goToStore} 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ir para a Loja
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <Card 
            key={index} 
            className="group overflow-hidden bg-white/95 backdrop-blur-sm border shadow-md hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <CardContent className="p-4 space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer aspect-square rounded-lg overflow-hidden">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-auto max-h-[90vh] p-0">
                  <div className="relative">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                        if (closeButton) closeButton.click();
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="secondary"
                onClick={() => handleSingleDownload(photo, index)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Transferir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;