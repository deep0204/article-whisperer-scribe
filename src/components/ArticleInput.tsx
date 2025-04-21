
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface ArticleInputProps {
  onSubmit: (text: string, length: number) => void;
  isLoading: boolean;
}

export const ArticleInput = ({ onSubmit, isLoading }: ArticleInputProps) => {
  const [text, setText] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<number>(25);

  const handleSubmit = () => {
    if (text.trim().length < 200) {
      toast.error('Please enter a longer article (minimum 200 characters)');
      return;
    }
    
    onSubmit(text, summaryLength);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Paste your article</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Paste your article or long text here..." 
          className="min-h-[300px] mb-4 font-serif leading-relaxed"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="summary-length" className="text-sm font-medium">
              Summary Length: {summaryLength}%
            </label>
            <span className="text-xs text-muted-foreground">
              {text ? `Characters: ${text.length}` : 'Paste your text above'}
            </span>
          </div>
          <Slider
            id="summary-length"
            defaultValue={[25]}
            max={50}
            min={10}
            step={5}
            onValueChange={(value) => setSummaryLength(value[0])}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={text.trim().length < 200 || isLoading}
        >
          {isLoading ? 'Summarizing...' : 'Summarize Article'}
        </Button>
      </CardFooter>
    </Card>
  );
};
