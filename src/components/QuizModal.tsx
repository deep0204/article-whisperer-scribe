
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

// Simple AI-powered quiz generator using Gemini prompt could be plugged here.
// For now, we simulate 5 basic questions related to summary text.
function generateQuizQuestions(summary: string) {
  // In real app, call aiService.geminiQuiz(summary) and parse results
  // Here, use dummy templated questions for demonstration:
  return [
    {
      question: "What is the main topic of the article?",
      options: [
        "Artificial Intelligence",
        "Cooking Recipes",
        "Sports Event",
        "Weather Forecast",
      ],
      answer: 0,
    },
    {
      question: "Which language is primarily used in the summary?",
      options: [
        "Hindi",
        "English",
        "Spanish",
        "None of the above",
      ],
      answer: 1,
    },
    {
      question: "What does the summary focus on?",
      options: [
        "Travel safety",
        "AI advancements",
        "Movie reviews",
        "Gardening tips",
      ],
      answer: 1,
    },
    {
      question: "Is AI considered safe in the summary?",
      options: [
        "Yes",
        "No",
        "Not mentioned",
        "Discussed in detail",
      ],
      answer: 0,
    },
    {
      question: "What is recommended for further improvement?",
      options: [
        "Reviewing AI basics",
        "Cooking more",
        "Visiting new countries",
        "Watching movies",
      ],
      answer: 0,
    },
  ];
}

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  summary: string;
  onSubmit: (score: number, suggestion: string) => void;
}

export function QuizModal({ open, onClose, summary, onSubmit }: QuizModalProps) {
  const [selected, setSelected] = useState<number[]>(Array(5).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<string>("");

  const questions = generateQuizQuestions(summary);

  useEffect(() => {
    if (!open) {
      setSelected(Array(5).fill(-1));
      setSubmitted(false);
      setScore(null);
      setSuggestion("");
    }
  }, [open]);

  function handleChange(idx: number, value: string) {
    const arr = [...selected];
    arr[idx] = parseInt(value, 10);
    setSelected(arr);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    const resultScore = Math.round((correct / questions.length) * 100);
    setScore(resultScore);
    let suggestionText = "";
    if (resultScore < 80) {
      suggestionText = "Review the article and try again for a better score!";
    } else {
      suggestionText = "Great job! You understood the article well.";
    }
    setSuggestion(suggestionText);
    setSubmitted(true);
    toast.success(`Quiz completed! You scored ${resultScore}/100`);
    onSubmit(resultScore, suggestionText);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Article Quiz</DialogTitle>
          <div className="text-sm text-muted-foreground">Answer all questions to test your understanding.</div>
        </DialogHeader>
        {!submitted ? (
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
                    <RadioGroupItem
                      key={i}
                      value={String(i)}
                      className="mr-2"
                      id={`q${idx}_opt${i}`}
                    >
                      <span className="ml-1">{opt}</span>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button type="submit" className="w-full">Submit Quiz</Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="text-2xl font-bold mb-2">Your Score: {score}/100</div>
            <div className="text-sm text-muted-foreground">{suggestion}</div>
            <Button className="mt-4" onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
