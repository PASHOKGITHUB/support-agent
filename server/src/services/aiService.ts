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
 * Generate vector embeddings for a given text.
 * Falls back to local Ollama if Gemini API is not configured or fails.
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.embedContent({
        model: 'gemini-embedding-2',
        contents: text,
      });
      if (response.embedding?.values) {
        return response.embedding.values;
      } else if ((response as any).embeddings?.[0]?.values) {
        return (response as any).embeddings[0].values;
      }
      throw new Error('Unexpected embedding response format from Gemini');
    } catch (error) {
      console.warn('Gemini embedding failed, falling back to Ollama:', (error as Error).message);
    }
  }

  // Fallback: Ollama nomic-embed-text
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${ollamaHost}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.statusText}`);
    }
    const data = (await response.json()) as any;
    if (data.embedding) {
      return data.embedding;
    }
    throw new Error('Ollama embedding response missing embedding array');
  } catch (error) {
    console.error('Ollama Embedding Error:', error);
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
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      const text = response.text;
      if (text) return text;
      throw new Error('Empty response from Gemini');
    } catch (error) {
      console.warn('Gemini generation failed, falling back to Ollama:', (error as Error).message);
    }
  }

  // Fallback: Ollama llama3
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        system: systemInstruction,
        prompt: prompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama generation error: ${response.statusText}`);
    }
    const data = (await response.json()) as any;
    return data.response;
  } catch (error) {
    console.error('Ollama Generation Error:', error);
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
  if (gemini) {
    try {
      const responseStream = await gemini.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) onChunk(text);
      }
      return;
    } catch (error) {
      console.warn('Gemini stream failed, falling back to Ollama:', (error as Error).message);
    }
  }

  // Fallback: Ollama llama3
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        system: systemInstruction,
        prompt: prompt,
        stream: true,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama stream error: ${response.statusText}`);
    }
    const reader = response.body;
    if (!reader) {
      throw new Error('Ollama response body is empty');
    }

    const decoder = new TextDecoder();
    for await (const chunk of reader as any) {
      const text = decoder.decode(chunk);
      const lines = text.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            onChunk(parsed.response);
          }
        } catch (err) {
          // ignore parsing error for incomplete JSON lines
        }
      }
    }
  } catch (error) {
    console.error('Ollama Streaming Error:', error);
    throw new Error(`AI Streaming failed: ${(error as Error).message}`);
  }
};
