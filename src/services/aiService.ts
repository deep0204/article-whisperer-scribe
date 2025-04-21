
// This service will handle the AI processing for summarization and Q&A

interface SummaryResponse {
  summary: string;
  error?: string;
}

interface AnswerResponse {
  answer: string;
  error?: string;
}

export class AIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('ai_api_key', key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('ai_api_key');
    }
    return this.apiKey;
  }

  async summarizeText(text: string, lengthPercentage: number): Promise<SummaryResponse> {
    // Get word count to estimate summary length
    const wordCount = text.split(/\s+/).length;
    const targetWords = Math.max(Math.round(wordCount * (lengthPercentage / 100)), 50);
    
    if (!this.getApiKey()) {
      return { error: 'API key not set', summary: '' };
    }

    try {
      // This is a placeholder for actual API call
      console.log('Making API call with Google AI API...');
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, let's create a simple summarization
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      const summaryLength = Math.max(Math.ceil(sentences.length * (lengthPercentage / 100)), 3);
      const summarySentences = sentences.slice(0, summaryLength);
      const summary = summarySentences.join(' ');
      
      return { summary };
    } catch (error) {
      console.error('Error in summarization:', error);
      return { 
        error: 'Failed to summarize text. Please try again.',
        summary: '' 
      };
    }
  }

  async answerQuestion(text: string, question: string): Promise<AnswerResponse> {
    if (!this.getApiKey()) {
      return { error: 'API key not set', answer: '' };
    }

    try {
      // This is a placeholder for actual API call
      console.log('Making API call to answer question with Google AI API...');
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, let's create a simple answer
      // In reality, this would be a call to the Google PaLM API
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      const randomIndex = Math.floor(Math.random() * Math.min(sentences.length, 5));
      const answer = `Based on the article: ${sentences[randomIndex]} This is a relevant insight to your question about "${question}".`;
      
      return { answer };
    } catch (error) {
      console.error('Error in answering question:', error);
      return { 
        error: 'Failed to answer question. Please try again.',
        answer: '' 
      };
    }
  }
}

export const aiService = new AIService();
