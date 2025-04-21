
// This service handles the AI processing using Google's Gemini API

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
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private modelName = "gemini-1.5-pro";

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
        Keep the summary coherent and well-structured.
        
        Text to summarize:
        ${text}
      `;
      
      const response = await fetch(
        `${this.baseUrl}/${this.modelName}:generateContent?key=${apiKey}`,
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
          error: `Error from Gemini API: ${errorData.error?.message || 'Unknown error'}`,
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
        `${this.baseUrl}/${this.modelName}:generateContent?key=${apiKey}`,
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
          error: `Error from Gemini API: ${errorData.error?.message || 'Unknown error'}`,
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
}

export const aiService = new AIService();
