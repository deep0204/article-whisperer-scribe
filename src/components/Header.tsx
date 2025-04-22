
import { useState } from "react";
import { Book, Key, User, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export const Header = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { user, signOut } = useSupabaseAuth();
  const nav = useNavigate();
  const location = useLocation();

  const handleSaveApiKey = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    toast.success('Gemini API key saved successfully');
  };

  const isActive = (path: string) =>
    location.pathname === path ? "text-brand-600 font-bold" : "text-muted-foreground";

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav("/")}>
          <Book className="h-6 w-6 text-brand-600" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Article</span>Whisperer
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className={isActive("/")} onClick={() => nav("/")}>Home</Button>
          <Button variant="ghost" size="sm" className={isActive("/history")} onClick={() => nav("/history")}>
            <History className="h-4 w-4 mr-1" /> History
          </Button>
          <Button variant="ghost" size="sm" className={isActive("/profile")} onClick={() => nav("/profile")}>
            <User className="h-4 w-4 mr-1" /> Profile
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setIsApiKeyModalOpen(true)}>
            <Key className="h-4 w-4" />
            API Key
          </Button>
          {!user ? (
            <Button variant="outline" size="sm" onClick={() => nav("/auth")}>
              Login / Register
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={signOut}>
              Logout
            </Button>
          )}
        </nav>
      </div>
      <ApiKeyModal
        open={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />
    </header>
  );
};
