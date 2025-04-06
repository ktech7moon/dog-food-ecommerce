import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";

interface AvatarSelectorProps {
  onClose?: () => void;
}

const dogAvatars = [
  { id: 1, url: "/avatars/dog1.jpg" },
  { id: 2, url: "/avatars/dog2.jpg" },
  { id: 3, url: "/avatars/dog3.jpg" },
  { id: 4, url: "/avatars/dog4.jpg" },
  { id: 5, url: "/avatars/dog5.jpg" },
  { id: 6, url: "/avatars/dog6.jpg" },
];

export function AvatarSelector({ onClose }: AvatarSelectorProps) {
  const { user, updateAvatar } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (value: string) => {
    setSelectedAvatar(value);
    setUploadedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setSelectedAvatar(null);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      if (uploadedImage) {
        await updateAvatar(uploadedImage, false);
      } else if (selectedAvatar) {
        await updateAvatar(selectedAvatar, true);
      }
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Failed to update avatar",
        description: "There was an error updating your avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Choose a dog avatar</Label>
        <RadioGroup
          value={selectedAvatar || ""}
          onValueChange={handleAvatarChange}
          className="grid grid-cols-3 gap-4 pt-2"
        >
          {dogAvatars.map((avatar) => (
            <div key={avatar.id} className="relative">
              <RadioGroupItem
                value={avatar.url}
                id={`avatar-${avatar.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`avatar-${avatar.id}`}
                className={`block h-16 w-16 rounded-full overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedAvatar === avatar.url
                    ? "border-primary scale-105"
                    : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <img
                  src={avatar.url}
                  alt={`Dog avatar ${avatar.id}`}
                  className="h-full w-full object-cover"
                />
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <Label className="text-base">Upload your own</Label>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {!uploadedImage ? (
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="w-full h-20 flex items-center justify-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  <span>Upload Image</span>
                </>
              )}
            </Button>
          ) : (
            <div className="relative w-full h-20 overflow-hidden rounded-md border">
              <img
                src={uploadedImage}
                alt="Uploaded avatar"
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background"
                onClick={clearUploadedImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Max file size: 2MB. Supported formats: JPEG, PNG, GIF
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!selectedAvatar && !uploadedImage}
        >
          Save Avatar
        </Button>
      </div>
    </div>
  );
}