import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

interface UserAvatarProps {
  className?: string;
  fallbackClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ 
  className = "", 
  fallbackClassName = "",
  size = "md" 
}: UserAvatarProps) {
  const { user } = useAuth();
  
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  // Get initials from user's name
  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {user?.avatarUrl && (
        <AvatarImage 
          src={user.avatarUrl} 
          alt={`${user.firstName} ${user.lastName}`} 
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {!user ? <User className="h-4 w-4" /> : getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}