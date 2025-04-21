
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface SummaryResultProps {
  summary: string;
  originalText: string;
  onAskQuestion: (question: string) => void;
  answer: string | null;
  isLoading: boolean;
}

export const SummaryResult = ({
  summary,
  originalText,
  onAskQuestion,
  answer,
  isLoading
}: SummaryResultProps) => {
  const [question, setQuestion] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleAsk = () => {
    if (question.trim().length < 5) {
      toast.error('Please enter a valid question');
      return;
    }
    
    onAskQuestion(question);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Article Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="ask">Ask Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-4">
            <div className="p-4 bg-muted/50 rounded-md mb-4">
              <p className="font-serif text-lg leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(summary)}
                className="flex gap-1"
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="flex gap-1"
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="ask" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ask any question about the article:</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g., What is the main point of the article?" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <Button onClick={handleAsk} disabled={isLoading}>
                    {isLoading ? 'Thinking...' : 'Ask'}
                  </Button>
                </div>
              </div>
              
              {answer && (
                <div className="p-4 bg-muted/50 rounded-md">
                  <h3 className="font-medium mb-2">Answer:</h3>
                  <p className="font-serif leading-relaxed">{answer}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => handleCopy(originalText)}>
          Copy Original Text
        </Button>
      </CardFooter>
    </Card>
  );
};
