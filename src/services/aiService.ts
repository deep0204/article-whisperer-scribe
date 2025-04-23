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

interface TranslationResponse {
  translation: string;
  error?: string;
}

interface Reference {
  title: string;
  url: string;
  type: string;
}

interface ReferencesResponse {
  references: Reference[];
  error?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface QuizResponse {
  questions: QuizQuestion[];
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

  async geminiTranslate(text: string, targetLanguage: string): Promise<TranslationResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { error: 'API key not set', translation: '' };
    }

    try {
      console.log(`Making API call to Google Gemini API for translation to ${targetLanguage}...`);
      
      const prompt = `
        Translate the following text into ${targetLanguage}. Maintain the original meaning, tone, and style as much as possible.
        
        Text to translate:
        ${text}
        
        Provide only the translated text without additional notes or explanations.
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
          translation: '' 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          translation: '' 
        };
      }
      
      const translation = data.candidates[0].content.parts[0].text.trim();
      return { translation };
    } catch (error) {
      console.error('Error in translation:', error);
      return { 
        error: 'Failed to translate text. Please check your API key and try again.',
        translation: '' 
      };
    }
  }

  async geminiReferences(prompt: string): Promise<ReferencesResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { error: 'API key not set', references: [] };
    }

    try {
      console.log('Making API call to Google Gemini API for references...');
      
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
              temperature: 0.3,
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
          references: [] 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          references: [] 
        };
      }
      
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      // Try to parse JSON from the response
      try {
        // First, try to extract JSON from the text if it's embedded
        let jsonString = responseText;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
        
        // Parse the references
        const references = JSON.parse(jsonString);
        
        if (!Array.isArray(references)) {
          return {
            error: 'Invalid reference format received',
            references: []
          };
        }
        
        // Validate and transform references
        const validReferences = references
          .filter(ref => ref && typeof ref.title === 'string' && typeof ref.url === 'string')
          .map(ref => ({
            title: ref.title,
            url: ref.url,
            type: ref.type || (ref.url.includes('youtube.com') ? 'youtube' : 'web')
          }));
        
        return { references: validReferences };
      } catch (parseError) {
        console.error('Error parsing references:', parseError);
        
        // Fallback: try to generate structured data by reparsing with Gemini
        try {
          const structurePrompt = `
            Convert the following text into a valid JSON array of reference objects.
            Each object should have 'title', 'url', and 'type' (either 'youtube' or 'web').
            
            Text to structure:
            ${responseText}
            
            Return ONLY valid JSON with no explanation:
          `;
          
          const structureResponse = await fetch(
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
                        text: structurePrompt
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
          
          if (structureResponse.ok) {
            const structureData = await structureResponse.json();
            const jsonText = structureData.candidates[0]?.content?.parts?.[0]?.text.trim();
            const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const structuredRefs = JSON.parse(jsonMatch[0]);
              if (Array.isArray(structuredRefs)) {
                return { 
                  references: structuredRefs.map(ref => ({
                    title: ref.title,
                    url: ref.url,
                    type: ref.type || (ref.url.includes('youtube.com') ? 'youtube' : 'web')
                  }))
                };
              }
            }
          }
        } catch (fallbackError) {
          console.error('Error in fallback parsing:', fallbackError);
        }
        
        return {
          error: 'Could not parse references from the AI response',
          references: []
        };
      }
    } catch (error) {
      console.error('Error getting references:', error);
      return { 
        error: 'Failed to get references. Please check your API key and try again.',
        references: [] 
      };
    }
  }

  async generateQuizQuestions(text: string): Promise<QuizResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return { error: 'API key not set', questions: [] };
    }

    try {
      console.log('Making API call to Google Gemini API for quiz generation...');
      
      const prompt = `
        Generate a 5-question multiple-choice quiz based on the following article summary.
        For each question:
        1. Create one clear question related to the content
        2. Provide exactly 4 possible answers with one correct answer
        3. Indicate which answer is correct (0 for first option, 1 for second, etc.)
        
        Summary:
        ${text}
        
        Format your response as a JSON array of objects with this exact structure:
        [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": 0
          },
          ... and so on for all 5 questions
        ]
        
        Return ONLY the JSON array with no additional text.
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
          questions: [] 
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return { 
          error: 'Received unexpected response format from Gemini API',
          questions: [] 
        };
      }
      
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      // Parse the JSON response
      try {
        // Find JSON array in the response
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        
        const questions = JSON.parse(jsonString);
        
        if (!Array.isArray(questions) || questions.length === 0) {
          return { 
            error: 'Failed to parse quiz questions from AI response',
            questions: [] 
          };
        }
        
        // Validate the format of each question
        const validQuestions = questions
          .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === 'number')
          .slice(0, 5); // Ensure we have at most 5 questions
        
        return { questions: validQuestions };
      } catch (parseError) {
        console.error('Error parsing quiz questions:', parseError);
        return { 
          error: 'Failed to parse quiz questions from AI response',
          questions: [] 
        };
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      return { 
        error: 'Failed to generate quiz. Please check your API key and try again.',
        questions: [] 
      };
    }
  }

  async generateQuizFeedback(summary: string, questions: QuizQuestion[], answers: number[]): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      return "Couldn't generate feedback: API key not set";
    }

    try {
      console.log('Making API call to Google Gemini API for quiz feedback...');
      
      // Create a string representing the user's answers and correct answers
      let resultsText = "Questions and Answers:\n\n";
      let correctCount = 0;
      
      questions.forEach((q, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === q.answer;
        if (isCorrect) correctCount++;
        
        resultsText += `Question ${index + 1}: ${q.question}\n`;
        resultsText += `User selected: "${q.options[userAnswer]}"\n`;
        resultsText += `Correct answer: "${q.options[q.answer]}"\n`;
        resultsText += `Result: ${isCorrect ? "Correct" : "Incorrect"}\n\n`;
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      
      const prompt = `
        Based on the following article summary and quiz results, provide personalized feedback.
        
        Summary of the article:
        ${summary}
        
        ${resultsText}
        
        Overall score: ${score}/100
        
        Provide tailored feedback (3-4 sentences) based on their performance. If they got questions wrong,
        briefly mention which concepts they should review. If they got everything right, provide encouraging feedback.
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
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 512,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return score >= 80 
          ? "Great job! You have a good understanding of the article."
          : "You might want to review the article again to improve your understanding.";
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected response format:', data);
        return score >= 80 
          ? "Great job! You have a good understanding of the article."
          : "You might want to review the article again to improve your understanding.";
      }
      
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Error generating feedback:', error);
      return score >= 80 
        ? "Great job! You have a good understanding of the article."
        : "You might want to review the article again to improve your understanding.";
    }
  }
}

export const aiService = new AIService();
