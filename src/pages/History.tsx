
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

type Article = {
  id: string;
  title: string;
  original_text: string;
  summary: string;
  created_at: string;
  quiz?: {
    score: number;
    suggestion: string | null;
  }
};

const History = () => {
  const { user, loading } = useSupabaseAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    async function fetchHistory() {
      const { data: history, error } = await supabase
        .from("article_history")
        .select("id,title,original_text,summary,created_at,quiz_results(id,score,suggestion)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        setArticles([]);
      } else {
        setArticles(
          (history || []).map((h: any) => ({
            ...h,
            quiz: h.quiz_results?.[0] || null,
          }))
        );
      }
      setLoadingHistory(false);
    }
    fetchHistory();
  }, [user]);

  if (loading) return <div className="p-8 flex justify-center items-center"><Loader className="animate-spin" /></div>;

  if (!user) return <div className="p-8 text-center">Please log in to see your history.</div>;

  if (loadingHistory) return <div className="p-8 flex justify-center items-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Article & Quiz History</CardTitle>
          <CardDescription>All your summarized articles and quiz records appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No history yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Quiz Score</TableHead>
                  <TableHead>Suggestions</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell className="font-semibold">{article.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{article.summary}</TableCell>
                    <TableCell>
                      {article.quiz ? article.quiz.score : <span className="italic text-muted-foreground">No Quiz</span>}
                    </TableCell>
                    <TableCell>
                      {article.quiz ? article.quiz.suggestion : <span className="italic text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>
                      {new Date(article.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
