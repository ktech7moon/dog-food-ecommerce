import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { csrfRequest } from "@/lib/csrf";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  avatarUrl?: string | null;
  usesDogAvatar?: boolean | null;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  isEnhancedAuthModalOpen: boolean;
  authModalTab: "login" | "signup";
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  openEnhancedAuthModal: (tab?: "login" | "signup") => void;
  closeEnhancedAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string, usesDogAvatar: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isEnhancedAuthModalOpen, setIsEnhancedAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Initial fetch to check authentication status
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        // If authenticated, set the user data
        if (res.ok) {
          const userData = await res.json();
          console.log("Authenticated user found:", userData.email);
          setUser(userData);
        } else {
          console.log("No authenticated user found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };
  
  const openEnhancedAuthModal = (tab?: "login" | "signup") => {
    if (tab) {
      setAuthModalTab(tab);
    }
    setIsEnhancedAuthModalOpen(true);
    // Close the old modals if they're open
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };
  
  const closeEnhancedAuthModal = () => {
    setIsEnhancedAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For login, use regular fetch with proper CORS credentials
      // This endpoint is exempted from CSRF protection in the backend
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await res.json();
      
      setUser(data.user);
      closeLoginModal();
      closeEnhancedAuthModal();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
        duration: 3000,
      });
      
      // Refresh cart data after login
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      
      // For registration, use regular fetch with proper CORS credentials
      // This endpoint is exempted from CSRF protection in the backend
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const data = await res.json();
      console.log("Signup response:", data);
      
      // Set the user in context
      setUser(data.user);
      closeSignupModal();
      closeEnhancedAuthModal();
      
      // Immediately fetch the full user data to update the context
      try {
        const userRes = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("Updated user data from API:", userData);
          setUser(userData); // Update user in context with full details
        }
      } catch (error) {
        console.error("Error fetching user data after signup:", error);
      }
      
      toast({
        title: "Account created",
        description: `Welcome to PawsomeMeals, ${data.user.firstName}!`,
        duration: 3000,
      });
      
      // Refresh cart data after signup
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // The actual navigation is handled in EnhancedAuthModal.tsx to ensure auth state is properly set
      if (data.needsOnboarding) {
        console.log("Onboarding flag detected in AuthContext");
      } else {
        console.log("No onboarding flag found in AuthContext");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Failed to create account";
      if (error.message?.includes("already exists")) {
        errorMessage = "Email already registered";
      } else if (error.message?.includes("Passwords don't match")) {
        errorMessage = "Passwords don't match";
      }
      
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // For logout, use regular fetch with proper CORS credentials
      // This endpoint is exempted from CSRF protection in the backend
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
      
      setUser(null);
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
        duration: 3000,
      });
      
      // Clear cart data after logout
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Use CSRF-protected request for profile updates
      const res = await csrfRequest("PUT", "/api/auth/user", userData);
      
      const updatedUser = await res.json();
      
      // Update local state with new user data
      setUser(prevUser => {
        if (!prevUser) return updatedUser;
        return { ...prevUser, ...updatedUser };
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      
      // Invalidate the user query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      return updatedUser;
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string, usesDogAvatar: boolean) => {
    try {
      setIsLoading(true);
      
      // Use the CSRF-protected request specifically for avatar updates
      const res = await csrfRequest("PUT", "/api/auth/user/avatar", { 
        avatarUrl, 
        usesDogAvatar 
      });
      
      const updatedUser = await res.json();
      
      // Update local state with new user data
      setUser(prevUser => {
        if (!prevUser) return updatedUser;
        return { ...prevUser, ...updatedUser };
      });
      
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
        duration: 3000,
      });
      
      // Invalidate the user query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      return updatedUser;
    } catch (error) {
      console.error("Update avatar error:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your avatar. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoginModalOpen,
      isSignupModalOpen,
      isEnhancedAuthModalOpen,
      authModalTab,
      openLoginModal,
      closeLoginModal,
      openSignupModal,
      closeSignupModal,
      openEnhancedAuthModal,
      closeEnhancedAuthModal,
      login,
      signup,
      logout,
      updateProfile,
      updateAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
