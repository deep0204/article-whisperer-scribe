
import { useState } from "react";
import { Book, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

export const Header = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSaveApiKey = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    toast.success('Gemini API key saved successfully');
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-brand-600" />
          <h1 className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Article</span>Whisperer
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            <Key className="h-4 w-4" />
            Set API Key
          </Button>
          <Button variant="outline" size="sm">History</Button>
        </div>
      </div>
      
      <ApiKeyModal 
        open={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />
    </header>
  );
};
