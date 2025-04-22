import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { ArticleInput } from '@/components/ArticleInput';
import { SummaryResult } from '@/components/SummaryResult';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { aiService } from '@/services/aiService';
import { getRandomSampleArticle } from '@/utils/mockTexts';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

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

  const handleQuizSubmit = async (score: number, suggestion: string) => {
    if (!user) {
      toast.error("Please login to submit quiz results.");
      return;
    }
    setQuizScore(score);
    setQuizSuggestion(suggestion);
    setQuizActive(false);

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
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3 gradient-text">Article Whisperer</h1>
            <p className="text-muted-foreground mb-6">
              Paste any article or enter a URL to get an AI-powered summary, take a quiz, and explore your history!
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
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
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
              {/* Quiz Section */}
              {summary && quizActive && (
                <QuizSection onSubmit={handleQuizSubmit} />
              )}
              {summary && !quizActive && quizScore !== null && (
                <div className="mt-4 p-4 bg-muted/40 rounded">
                  <p className="font-bold">Quiz Score: {quizScore}/100</p>
                  {quizSuggestion && <p className="text-sm text-muted-foreground mt-2">Suggestion: {quizSuggestion}</p>}
                </div>
              )}
            </div>
            {/* Add instructions and exploration hints */}
            <div className="bg-accent/10 rounded-lg p-4 h-fit shadow-md space-y-4">
              <h3 className="font-bold text-xl">What’s New:</h3>
              <ul className="list-disc space-y-2 ml-6">
                <li>🔑 Login/Register to unlock AI-powered article tracking!</li>
                <li>📝 Summarize articles and see them in your History tab.</li>
                <li>🌟 Take personalized quizzes and get learning suggestions.</li>
                <li>🗂️ View your quiz scores and summaries in "History".</li>
                <li>👤 Manage your profile and see your info in "Profile".</li>
              </ul>
            </div>
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

function QuizSection({ onSubmit }: { onSubmit: (score: number, suggestion: string) => void }) {
  // Simple simulated quiz: (in future, use AI to build quiz from summary)
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleQuiz(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Fake evaluation
    setTimeout(() => {
      const score = answer.trim().toLowerCase() === "ai" ? 100 : 60;
      const suggestion = score < 90 ? "Review the section about AI basics!" : "Great work!";
      onSubmit(score, suggestion);
      setLoading(false);
    }, 1000);
  }

  return (
    <form onSubmit={handleQuiz} className="mt-8 p-4 bg-muted/50 rounded space-y-4">
      <div className="font-semibold mb-2">Quiz: What is the main topic of the article?</div>
      <input
        className="w-full border rounded px-3 py-2"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        placeholder="Your answer..."
      />
      <Button disabled={loading} className="w-full">{loading ? "Submitting..." : "Submit Quiz"}</Button>
      {error && <div className="text-destructive">{error}</div>}
    </form>
  );
}

export default Index;
