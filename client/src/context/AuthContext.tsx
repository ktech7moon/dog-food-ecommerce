import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

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
        const res = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
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
      
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
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
      
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      
      setUser(data.user);
      closeSignupModal();
      closeEnhancedAuthModal();
      
      toast({
        title: "Account created",
        description: `Welcome to PawsomeMeals, ${data.user.firstName}!`,
        duration: 3000,
      });
      
      // Refresh cart data after signup
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
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
      
      await apiRequest("POST", "/api/auth/logout", undefined);
      
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
      
      const res = await apiRequest("PUT", "/api/auth/user", userData);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }
      
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
        description: "There was a problem updating your profile",
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
      updateProfile
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
