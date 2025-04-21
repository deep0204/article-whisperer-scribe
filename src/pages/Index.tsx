
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ArticleInput } from '@/components/ArticleInput';
import { SummaryResult } from '@/components/SummaryResult';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { aiService } from '@/services/aiService';
import { getRandomSampleArticle } from '@/utils/mockTexts';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);

  useEffect(() => {
    // Check if API key exists
    const apiKey = aiService.getApiKey();
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (apiKey: string) => {
    aiService.setApiKey(apiKey);
    toast.success('API key saved successfully');
  };

  const handleSubmit = async (text: string, length: number) => {
    if (!aiService.getApiKey()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setOriginalText(text);
    
    try {
      const result = await aiService.summarizeText(text, length);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      setSummary(result.summary);
      setAnswer(null); // Reset any previous answers
    } catch (error) {
      toast.error('An error occurred during summarization');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!aiService.getApiKey()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    if (!originalText) {
      toast.error('Please summarize an article first');
      return;
    }

    setIsAnswerLoading(true);
    
    try {
      const result = await aiService.answerQuestion(originalText, question);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      setAnswer(result.answer);
    } catch (error) {
      toast.error('An error occurred while answering your question');
      console.error(error);
    } finally {
      setIsAnswerLoading(false);
    }
  };

  const loadSampleArticle = () => {
    const sample = getRandomSampleArticle();
    setOriginalText(sample.text);
    handleSubmit(sample.text, 25);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3 gradient-text">Article Whisperer</h1>
            <p className="text-muted-foreground mb-6">
              Paste any article or enter a URL to get an AI-powered summary and ask questions about the content
            </p>
            {!summary && (
              <Button 
                variant="outline" 
                onClick={loadSampleArticle}
                className="mx-auto"
                disabled={isLoading}
              >
                Try with Sample Article
              </Button>
            )}
          </div>
          
          <div className="grid gap-8">
            {!summary ? (
              <ArticleInput 
                onSubmit={handleSubmit} 
                isLoading={isLoading}
              />
            ) : (
              <SummaryResult 
                summary={summary}
                originalText={originalText}
                onAskQuestion={handleAskQuestion}
                answer={answer}
                isLoading={isAnswerLoading}
              />
            )}
            
            {summary && (
              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSummary(null);
                    setAnswer(null);
                  }}
                >
                  Summarize Another Article
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t bg-muted/30">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground">
            Article Whisperer © {new Date().getFullYear()} - AI-powered article summarization and analysis
          </p>
        </div>
      </footer>
      
      <ApiKeyModal 
        open={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default Index;
