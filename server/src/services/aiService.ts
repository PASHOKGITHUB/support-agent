import { GoogleGenAI } from '@google/genai';

let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

/**
 * Retries an async Gemini request if it fails due to rate limits or quota issues.
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorString = String(error).toLowerCase();
    const isRateLimit = 
      error?.status === 429 || 
      error?.statusCode === 429 ||
      errorString.includes('429') ||
      errorString.includes('resource_exhausted') ||
      errorString.includes('rate limit') ||
      errorString.includes('quota');

    if (isRateLimit && retries > 0) {
      console.warn(`[AI Service] Gemini API Rate Limit encountered. Retrying in ${delay}ms... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 1.5 + Math.random() * 200); // 1.5x backoff with jitter
    }
    throw error;
  }
};

/**
 * Generate vector embeddings for a given text.
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
  }
  try {
    const response = await retryWithBackoff<any>(() => 
      gemini.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
      })
    );
    if (response.embedding?.values) {
      return response.embedding.values;
    } else if ((response as any).embeddings?.[0]?.values) {
      return (response as any).embeddings[0].values;
    }
    throw new Error('Unexpected embedding response format from Gemini');
  } catch (error) {
    console.error('Gemini Embedding Error:', error);
    throw new Error(`Embedding generation failed: ${(error as Error).message}`);
  }
};

/**
 * Generate a non-streaming chat response.
 */
export const generateChatResponse = async (
  prompt: string,
  systemInstruction: string
): Promise<string> => {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
  }
  try {
    const response = await retryWithBackoff<any>(() =>
      gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      })
    );
    const text = response.text;
    if (text) return text;
    throw new Error('Empty response from Gemini');
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    throw new Error(`AI generation failed: ${(error as Error).message}`);
  }
};

/**
 * Generate a streaming chat response and execute a callback for each chunk.
 */
export const generateChatResponseStream = async (
  prompt: string,
  systemInstruction: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
  }
  try {
    const responseStream = await retryWithBackoff<any>(() =>
      gemini.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      })
    );
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error) {
    console.error('Gemini Streaming Error:', error);
    throw new Error(`AI Streaming failed: ${(error as Error).message}`);
  }
};

/**
 * Condense a conversational query into a standalone query using conversation history.
 */
export const condenseSearchQuery = async (
  text: string,
  history: any[]
): Promise<string> => {
  if (!history || history.length === 0) return text;

  // Format recent chat messages
  const historyText = history
    .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const systemInstruction = 
    'You are a search query optimizer. Given a conversation history and a new query, ' +
    'your job is to write a single search-friendly phrase that captures the core entity/question. ' +
    'Do not output greeting, explanation, or conversational text. Output ONLY the standalone search query.';

  const prompt = `
Conversation History:
${historyText}

New Query: ${text}

Output the optimized standalone query:`;

  try {
    const condensed = await generateChatResponse(prompt, systemInstruction);
    if (condensed && condensed.trim().length > 0) {
      return condensed.trim();
    }
  } catch (error) {
    console.warn('Failed to condense search query, falling back to raw input:', (error as Error).message);
  }
  return text;
};
