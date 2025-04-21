
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Globe, FileText, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleInputProps {
  onSubmit: (text: string, length: number) => void;
  isLoading: boolean;
}

export const ArticleInput = ({ onSubmit, isLoading }: ArticleInputProps) => {
  const [text, setText] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<number>(25);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'url'>('text');

  const handleSubmit = () => {
    if (inputType === 'text') {
      if (text.trim().length < 200) {
        toast.error('Please enter a longer article (minimum 200 characters)');
        return;
      }
      onSubmit(text, summaryLength);
    } else {
      if (!isValidUrl(url)) {
        toast.error('Please enter a valid URL');
        return;
      }
      fetchArticleFromUrl();
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const fetchArticleFromUrl = async () => {
    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setIsUrlLoading(true);
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Simple extraction of text from HTML - this is a basic implementation
      // A more robust solution would use a proper HTML parser
      const tempElement = document.createElement('div');
      tempElement.innerHTML = html;
      
      // Remove scripts, styles, and other non-content elements
      const scriptsAndStyles = tempElement.querySelectorAll('script, style, nav, footer, header, aside, form');
      scriptsAndStyles.forEach(el => el.remove());
      
      // Get text from main content areas
      const mainContent = tempElement.querySelector('main, article, #content, .content, .article, .post');
      const extractedText = mainContent 
        ? mainContent.textContent 
        : tempElement.textContent;
      
      const cleanText = extractedText
        ?.replace(/\s+/g, ' ')
        .trim();
      
      if (!cleanText || cleanText.length < 200) {
        toast.error('Could not extract enough text from the provided URL');
        return;
      }
      
      setText(cleanText);
      setInputType('text');
      toast.success('Article extracted successfully');
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to fetch article from URL. Please try pasting the text directly.');
    } finally {
      setIsUrlLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Summarize Content</CardTitle>
        <CardDescription>
          Enter an article text or provide a URL to summarize it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'text' | 'url')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Enter URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <Textarea 
              placeholder="Paste your article or long text here..." 
              className="min-h-[300px] font-serif leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="summary-length" className="text-sm font-medium">
                      Summary Length: {summaryLength}%
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {text ? `${text.length} characters` : 'Paste your text above'}
                    </span>
                  </div>
                  <Slider
                    id="summary-length"
                    value={[summaryLength]}
                    max={50}
                    min={10}
                    step={5}
                    onValueChange={(value) => setSummaryLength(value[0])}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={fetchArticleFromUrl} 
                disabled={isUrlLoading || !url}
                type="button"
              >
                {isUrlLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
                Fetch
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Enter a URL to extract and analyze an article from the web
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <Button 
          className="w-full"
          onClick={handleSubmit} 
          disabled={(inputType === 'text' && text.trim().length < 200) || 
                   (inputType === 'url' && !isValidUrl(url)) || 
                   isLoading || 
                   isUrlLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Processing...' : 'Summarize Content'}
        </Button>
      </CardFooter>
    </Card>
  );
};
