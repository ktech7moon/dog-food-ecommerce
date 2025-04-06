import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AvatarSelector } from "./AvatarSelector";
import { ReactNode, useState } from "react";

interface AvatarModalProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
}

export function AvatarModal({
  trigger,
  title = "Choose Your Avatar",
  description = "Select a dog avatar or upload your own image",
}: AvatarModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AvatarSelector onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}