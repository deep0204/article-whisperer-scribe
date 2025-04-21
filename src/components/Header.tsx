
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
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
          <Button variant="ghost" size="sm">How it works</Button>
          <Button variant="outline" size="sm">History</Button>
        </div>
      </div>
    </header>
  );
};
