import { X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogContent, DialogClose } from "../ui/dialog";

interface PhotoModalProps {
  photo: string;
  index: number;
}

const PhotoModal = ({ photo, index }: PhotoModalProps) => {
  return (
    <DialogContent className="max-w-[95vw] w-auto p-0 bg-transparent border-none">
      <div className="relative w-full h-[90vh] flex items-center justify-center bg-black/80">
        <img
          src={photo}
          alt={`Foto ${index + 1}`}
          className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
        />
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

export default PhotoModal;