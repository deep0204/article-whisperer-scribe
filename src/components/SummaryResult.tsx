
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Copy, Share2, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { aiService } from '@/services/aiService';

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
  const [question, setQuestion] = useState<string>('');
  const [authenticityScore, setAuthenticityScore] = useState<number | null>(null);
  const [authenticityExplanation, setAuthenticityExplanation] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('summary');

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
    setActiveTab('qa');
  };

  const analyzeAuthenticity = async () => {
    if (!originalText) {
      toast.error('No content to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAuthenticityScore(null);
      setAuthenticityExplanation('');
      
      const result = await aiService.analyzeAuthenticity(originalText);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      setAuthenticityScore(result.score);
      setAuthenticityExplanation(result.explanation);
      setActiveTab('authenticity');
    } catch (error) {
      console.error('Error analyzing authenticity:', error);
      toast.error('Failed to analyze authenticity');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-200";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return "Not analyzed";
    if (score >= 80) return "Highly reliable";
    if (score >= 60) return "Mostly reliable";
    if (score >= 40) return "Somewhat reliable";
    if (score >= 20) return "Questionable";
    return "Highly unreliable";
  };

  const getScoreIcon = (score: number | null) => {
    if (score === null) return null;
    if (score >= 60) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 40) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Analysis</CardTitle>
        <CardDescription>View the summarized content and analyze it</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
            <TabsTrigger value="authenticity" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Authenticity
            </TabsTrigger>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={analyzeAuthenticity}
                disabled={isAnalyzing}
                className="flex gap-1 ml-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> 
                    Check Authenticity
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="qa" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ask any question about the article:</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g., What is the main point of the article?" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <Button 
                    onClick={handleAsk} 
                    disabled={isLoading || question.trim().length < 5}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoading ? 'Loading...' : 'Ask'}
                  </Button>
                </div>
              </div>
              
              {answer && (
                <div className="p-4 bg-muted/50 rounded-md">
                  <h3 className="font-medium mb-2">Answer:</h3>
                  <p className="font-serif leading-relaxed">{answer}</p>
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(answer)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" /> Copy Answer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="authenticity" className="mt-4 space-y-4">
            {authenticityScore === null ? (
              <div className="p-8 text-center space-y-4">
                <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium text-lg">Authenticity Check</h3>
                  <p className="text-muted-foreground mt-1">
                    Analyze the reliability and credibility of this content
                  </p>
                </div>
                <Button 
                  onClick={analyzeAuthenticity}
                  disabled={isAnalyzing}
                  className="mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Analyze Authenticity
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      {getScoreIcon(authenticityScore)}
                      Authenticity Score: {authenticityScore}/100
                    </h3>
                    <span className="text-sm font-medium">{getScoreLabel(authenticityScore)}</span>
                  </div>
                  
                  <Progress value={authenticityScore} className={`h-2 w-full ${getScoreColor(authenticityScore)}`} />
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Analysis:</h4>
                    <p className="text-sm text-muted-foreground">{authenticityExplanation}</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(`Authenticity Score: ${authenticityScore}/100\n\n${authenticityExplanation}`)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" /> Copy Analysis
                  </Button>
                </div>
              </div>
            )}
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
