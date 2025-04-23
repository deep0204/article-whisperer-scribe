
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { aiService } from "@/services/aiService";
import { Loader2 } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  summary: string;
  onSubmit: (score: number, suggestion: string) => void;
}

export function QuizModal({ open, onClose, summary, onSubmit }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<string>("");
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  useEffect(() => {
    if (open) {
      fetchQuestions();
    } else {
      // Reset state when modal closes
      setSelected([]);
      setSubmitted(false);
      setScore(null);
      setSuggestion("");
    }
  }, [open, summary]);

  const fetchQuestions = async () => {
    if (!summary) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.generateQuizQuestions(summary);
      
      if (result.error) {
        console.error("Error generating quiz:", result.error);
        setError(result.error);
        toast.error("Failed to generate quiz questions");
        return;
      }
      
      if (result.questions.length === 0) {
        setError("No questions were generated. Please try again.");
        toast.error("Failed to generate quiz questions");
        return;
      }
      
      setQuestions(result.questions);
      setSelected(Array(result.questions.length).fill(-1));
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Failed to generate quiz questions");
    } finally {
      setLoading(false);
    }
  };

  function handleChange(idx: number, value: string) {
    const arr = [...selected];
    arr[idx] = parseInt(value, 10);
    setSelected(arr);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Check if all questions are answered
    if (selected.some(val => val === -1)) {
      toast.error("Please answer all questions");
      return;
    }
    
    let correct = 0;
    questions.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    
    const resultScore = Math.round((correct / questions.length) * 100);
    setScore(resultScore);
    
    // Generate personalized feedback
    setGeneratingFeedback(true);
    try {
      const feedback = await aiService.generateQuizFeedback(summary, questions, selected);
      setSuggestion(feedback);
    } catch (error) {
      console.error("Error generating feedback:", error);
      setSuggestion(resultScore >= 80 
        ? "Great job! You have a good understanding of the article." 
        : "You might want to review the article again to improve your understanding.");
    } finally {
      setGeneratingFeedback(false);
    }
    
    setSubmitted(true);
    toast.success(`Quiz completed! You scored ${resultScore}/100`);
    onSubmit(resultScore, suggestion);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Article Quiz</DialogTitle>
          <div className="text-sm text-muted-foreground">Answer all questions to test your understanding.</div>
        </DialogHeader>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Generating quiz questions based on the article...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 my-4 text-center bg-destructive/10 rounded-md">
            <p className="text-destructive font-medium">Error generating quiz questions</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={fetchQuestions} 
              variant="outline" 
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!loading && !error && !submitted && questions.length > 0 && (
          <form className="space-y-6 mt-2" onSubmit={handleSubmit}>
            {questions.map((q, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded">
                <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
                <RadioGroup
                  value={selected[idx] > -1 ? String(selected[idx]) : ""}
                  onValueChange={(v) => handleChange(idx, v)}
                  className="space-y-2"
                  required
                >
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(i)} id={`q${idx}_opt${i}`} />
                      <Label htmlFor={`q${idx}_opt${i}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button type="submit" className="w-full">Submit Quiz</Button>
          </form>
        )}
        
        {submitted && (
          <div className="text-center py-8">
            <div className="text-2xl font-bold mb-2">Your Score: {score}/100</div>
            {generatingFeedback ? (
              <div className="flex flex-col items-center justify-center mt-4 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Generating personalized feedback...</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{suggestion}</div>
            )}
            <Button className="mt-4" onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
