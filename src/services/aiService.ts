
// This service handles the AI processing using Google's Gemini API

interface SummaryResponse {
  summary: string;
  error?: string;
}

interface AnswerResponse {
  answer: string;
  error?: string;
}

interface AuthenticityResponse {
  score: number;
  explanation: string;
  error?: string;
}

export class AIService {
  private apiKey: string | null = null;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private model = "gemini-1.5-pro";

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
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { error: 'API key not set', summary: '' };
    }

    try {
      // Calculate target length based on percentage
      const wordCount = text.split(/\s+/).length;
      const targetWords = Math.max(Math.round(wordCount * (lengthPercentage / 100)), 50);
      
      console.log('Making API call to Google Gemini API for summarization...');
      
      const prompt = `
        Summarize the following text in approximately ${targetWords} words while maintaining the key points and main ideas.
        
        Text to summarize:
        ${text}
      `;
      
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return { 
          error: `Error from Gemini API: ${errorData.error?.message || response.statusText}`,
          summary: '' 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          summary: '' 
        };
      }
      
      const summary = data.candidates[0].content.parts[0].text.trim();
      return { summary };
    } catch (error) {
      console.error('Error in summarization:', error);
      return { 
        error: 'Failed to summarize text. Please check your API key and try again.',
        summary: '' 
      };
    }
  }

  async answerQuestion(text: string, question: string): Promise<AnswerResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { error: 'API key not set', answer: '' };
    }

    try {
      console.log('Making API call to Google Gemini API for question answering...');
      
      const prompt = `
        Context information is below.
        ---------------------
        ${text}
        ---------------------
        Given the context information and not prior knowledge, answer the question: ${question}
        Provide a comprehensive answer based solely on the information in the text. If the information to answer the question is not present in the text, state that you cannot answer based on the provided information.
      `;
      
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return { 
          error: `Error from Gemini API: ${errorData.error?.message || response.statusText}`,
          answer: '' 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          answer: '' 
        };
      }
      
      const answer = data.candidates[0].content.parts[0].text.trim();
      return { answer };
    } catch (error) {
      console.error('Error in answering question:', error);
      return { 
        error: 'Failed to answer question. Please check your API key and try again.',
        answer: '' 
      };
    }
  }

  async analyzeAuthenticity(text: string): Promise<AuthenticityResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { 
        error: 'API key not set', 
        score: 0,
        explanation: '' 
      };
    }

    try {
      console.log('Making API call to Google Gemini API for authenticity analysis...');
      
      const prompt = `
        Analyze the credibility and reliability of the following text. 
        Look for indicators of misinformation, bias, factual inconsistencies, and propaganda techniques.
        Rate the overall authenticity on a scale from 0 to 100, where:
        - 0-20: Highly unreliable, contains obvious misinformation or propaganda
        - 21-40: Questionable, shows significant bias or factual issues
        - 41-60: Somewhat reliable, mixed quality with some potential issues
        - 61-80: Mostly reliable, minor issues but generally trustworthy
        - 81-100: Highly reliable, factual, balanced, and trustworthy
        
        Provide your numerical score and a brief explanation of your assessment.
        
        Text to analyze:
        ${text}
        
        Format your response exactly like this:
        Score: [numerical score between 0-100]
        
        Explanation: [your explanation]
      `;
      
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return { 
          error: `Error from Gemini API: ${errorData.error?.message || response.statusText}`,
          score: 0,
          explanation: '' 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          score: 0,
          explanation: '' 
        };
      }
      
      const analysisText = data.candidates[0].content.parts[0].text.trim();
      
      // Extract score and explanation using regex
      const scoreMatch = analysisText.match(/Score:\s*(\d+)/i);
      const explanationMatch = analysisText.match(/Explanation:\s*([\s\S]+)/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided';
      
      return { score, explanation };
    } catch (error) {
      console.error('Error in analyzing authenticity:', error);
      return { 
        error: 'Failed to analyze authenticity. Please check your API key and try again.',
        score: 0,
        explanation: '' 
      };
    }
  }
}

export const aiService = new AIService();
