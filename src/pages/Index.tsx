import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArticleInput } from '@/components/ArticleInput';
import { SummaryResult } from '@/components/SummaryResult';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { aiService } from '@/services/aiService';
import { getRandomSampleArticle } from '@/utils/mockTexts';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizModal } from "@/components/QuizModal"; // Add new import

const Index = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSuggestion, setQuizSuggestion] = useState<string | null>(null);

  const { user } = useSupabaseAuth();

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

      // Store in Supabase if authenticated
      if (user) {
        // TODO: Generate title via Gemini or fallback
        const title = text.slice(0, 50).replace(/\s+/g, " ") + "...";
        await supabase.from("article_history").insert([
          {
            user_id: user.id,
            title: title, // update with Gemini title if needed
            original_text: text,
            summary: result.summary,
          },
        ]);
      }
      setQuizActive(true);
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

  const [quizModalOpen, setQuizModalOpen] = useState(false);

  // Handler for clearing the summary
  const handleClearSummary = () => {
    setSummary(null);
    setOriginalText("");
    setAnswer(null);
    setQuizActive(false);
    setQuizScore(null);
    setQuizSuggestion(null);
  };

  // Handler to launch the quiz modal
  const handleOpenQuiz = () => {
    setQuizModalOpen(true);
  };

  // Handler to process quiz results
  const handleQuizFinished = async (score: number, suggestion: string) => {
    setQuizScore(score);
    setQuizSuggestion(suggestion);
    setQuizActive(false);
    setQuizModalOpen(false);

    if (!user) {
      toast.error("Please login to submit quiz results.");
      return;
    }

    // Save quiz result (get latest article_history_id)
    const { data, error } = await supabase
      .from("article_history")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data?.[0]) {
      toast.error("Failed to record quiz result.");
      return;
    }

    const articleHistoryId = data[0].id;
    const { error: quizError } = await supabase.from("quiz_results").insert([
      {
        article_history_id: articleHistoryId,
        user_id: user.id,
        score,
        suggestion,
      },
    ]);
    if (quizError) {
      toast.error("Failed to save quiz result.");
    } else {
      toast.success(`Quiz submitted! Score: ${score}/100`);
    }
  };

  const loadSampleArticle = () => {
    const sample = getRandomSampleArticle();
    setOriginalText(sample.text);
    handleSubmit(sample.text, 25);
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3 gradient-text">Article Whisperer</h1>
            <p className="text-muted-foreground mb-6">
              Paste any article or enter a URL to get an AI-powered summary and optionally take a quiz.
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
          <div className="flex flex-col items-center">
            <div className="w-full">
              {!summary ? (
                <ArticleInput 
                  onSubmit={handleSubmit} 
                  isLoading={isLoading}
                  cardClassName="min-h-[550px] text-base" // optional: add a prop for extra styling
                />
              ) : (
                <>
                  <SummaryResult 
                    summary={summary}
                    originalText={originalText}
                    onAskQuestion={handleAskQuestion}
                    answer={answer}
                    isLoading={isAnswerLoading}
                  />
                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
                    <Button variant="secondary" onClick={handleClearSummary}>
                      Summarize Another Article
                    </Button>
                    <Button
                      onClick={handleOpenQuiz}
                      className="bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                    >
                      Take a Quiz
                    </Button>
                  </div>
                </>
              )}
              {/* Remove obsolete QuizSection and quiz result blocks */}
              {summary && !quizActive && quizScore !== null && (
                <div className="mt-4 p-4 bg-muted/40 rounded">
                  <p className="font-bold">Quiz Score: {quizScore}/100</p>
                  {quizSuggestion && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Suggestion: {quizSuggestion}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="py-8 border-t bg-muted/30 mt-8">
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
      {/* Quiz Modal */}
      {summary && (
        <QuizModal
          open={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          summary={summary}
          onSubmit={handleQuizFinished}
        />
      )}
    </div>
  );
};

export default Index;
