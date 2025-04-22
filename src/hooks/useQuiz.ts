
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useQuiz(articleHistoryId: string, userId: string | undefined) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitQuiz(score: number, suggestion: string) {
    if (!userId) {
      setError("User not authenticated");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const { error } = await supabase.from("quiz_results").insert([
      { article_history_id: articleHistoryId, user_id: userId, score, suggestion }
    ]);
    setIsSubmitting(false);
    if (error) setError(error.message);
  }

  return { submitQuiz, isSubmitting, error };
}
