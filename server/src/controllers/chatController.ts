import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Chat } from '../models/Chat.js';
import { SupportConfig } from '../models/SupportConfig.js';
import { retrieveContext } from '../services/ragService.js';
import { generateChatResponseStream, condenseSearchQuery } from '../services/aiService.js';
import mongoose from 'mongoose';

export const createChatSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID missing.' });
    }

    const chat = await Chat.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      title: 'New Conversation',
      companyId: req.companyId ? new mongoose.Types.ObjectId(req.companyId) : undefined,
      messages: []
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat session error:', error);
    return res.status(500).json({ message: 'Server error creating chat session.' });
  }
};

export const getChatSessions = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.userId) {
      filter.userId = new mongoose.Types.ObjectId(req.userId);
    }
    if (req.companyId) {
      filter.companyId = new mongoose.Types.ObjectId(req.companyId);
    }

    const chats = await Chat.find(filter)
      .select('title createdAt messages')
      .sort({ createdAt: -1 });

    return res.status(200).json(chats);
  } catch (error) {
    console.error('Get chat sessions error:', error);
    return res.status(500).json({ message: 'Server error fetching chats.' });
  }
};

export const getChatSession = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    if (req.companyId && chat.companyId?.toString() !== req.companyId) {
      return res.status(403).json({ message: 'Unauthorized access to this chat.' });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error('Get chat session error:', error);
    return res.status(500).json({ message: 'Server error fetching chat details.' });
  }
};

export const deleteChatSession = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    if (req.companyId && chat.companyId?.toString() !== req.companyId) {
      return res.status(403).json({ message: 'Unauthorized access to this chat.' });
    }

    await Chat.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Chat session deleted.' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    return res.status(500).json({ message: 'Server error deleting chat.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    // Condense user query using recent chat history
    const recentHistory = chat.messages.slice(-5);
    const condensedQuery = await condenseSearchQuery(text, recentHistory);

    // 1. Retrieve contexts matching the search query
    const contexts = await retrieveContext(condensedQuery, 4, req.companyId?.toString());

    // 2. Fetch Support config for the company/default
    const companyFilter = req.companyId 
      ? { companyId: new mongoose.Types.ObjectId(req.companyId) } 
      : { companyId: { $exists: false } };
      
    let support = await SupportConfig.findOne(companyFilter);
    if (!support) {
      support = new SupportConfig({
        companyName: 'System Support',
        supportEmail: 'support@example.com',
        workingHours: '9:00 AM - 5:00 PM (Mon-Fri)'
      });
    }

    // 3. Build system instruction prompt based on AI Response Policy
    const contextText = contexts.length > 0
      ? contexts.map((c, i) => `[Source ${i + 1} - ${c.filename}]: ${c.text}`).join('\n\n')
      : 'NO APPLICABLE KNOWLEDGE BASE DOCUMENTS ARE UPLOADED YET.';

    const systemInstruction = `
You are a professional AI customer support assistant for "${support.companyName}".
Your objective is to answer the user's question accurately, concisely, and transparently.

STRICT RESPONSE RULES:
1. Answer the question ONLY using the facts and details provided in the "Knowledge Base Context" section below.
2. Never invent, guess, or hallucinate information that is not explicitly in the context.
3. If the information is not present in the documentation (or if the context is empty), clearly state:
   "I apologize, but I couldn't find details on that. Please feel free to contact our support team directly for assistance:"
   Then, present the customer with the official company support details listed below.
4. Do not mention or reference information from outside the provided context.
5. If answering from the context, include citation references like (Source: filename.pdf) or "[Source X]" in your text.

Official Escalation Contact Details:
- Support Email: ${support.supportEmail}
${support.supportPhone ? `- Support Phone: ${support.supportPhone}` : ''}
${support.supportWebsite ? `- Support Website: ${support.supportWebsite}` : ''}
${support.contactFormLink ? `- Contact Form: ${support.contactFormLink}` : ''}
- Support Hours: ${support.workingHours}

Knowledge Base Context:
----------------------------------------
${contextText}
----------------------------------------
`;

    // Configure Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const historyText = recentHistory
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const fullPrompt = historyText 
      ? `Conversation History:\n${historyText}\n\nUser: ${text}`
      : text;

    let fullResponseText = '';

    // Generate content stream
    await generateChatResponseStream(
      fullPrompt,
      systemInstruction,
      (chunk) => {
        fullResponseText += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );

    // Save transaction to DB
    const userMsg = {
      sender: 'user' as const,
      text: text,
      createdAt: new Date()
    };

    const citations = contexts.map(c => ({
      documentId: c.documentId,
      filename: c.filename,
      snippet: c.text.length > 200 ? c.text.substring(0, 200) + '...' : c.text
    }));

    const assistantMsg = {
      sender: 'assistant' as const,
      text: fullResponseText,
      // Only attach citations if we actually found context
      citations: contexts.length > 0 ? citations : [],
      createdAt: new Date()
    };

    chat.messages.push(userMsg);
    chat.messages.push(assistantMsg);

    // Auto rename session based on first query
    if (chat.messages.length <= 2 && chat.title === 'New Conversation') {
      chat.title = text.length > 40 ? text.substring(0, 40) + '...' : text;
    }

    await chat.save();

    // Signal completion
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error generating and streaming chat reply:', error);
    
    try {
      const chat = await Chat.findById(id);
      
      const fallbackText = `I apologize, but the AI is experiencing temporary high traffic and cannot process your message right now. Please try again in a few moments, or check your API usage quota in your admin billing settings.`;

      // Stream the fallback text to the client so it appears in the chat bubble
      res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
      
      // Save user and fallback assistant message to database to maintain session history
      if (chat) {
        const userMsg = {
          sender: 'user' as const,
          text: text,
          createdAt: new Date()
        };
        const assistantMsg = {
          sender: 'assistant' as const,
          text: fallbackText,
          citations: [],
          createdAt: new Date()
        };
        chat.messages.push(userMsg);
        chat.messages.push(assistantMsg);
        
        if (chat.messages.length <= 2 && chat.title === 'New Conversation') {
          chat.title = text.length > 40 ? text.substring(0, 40) + '...' : text;
        }
        await chat.save();
      }
      
    } catch (dbErr) {
      console.error('Error during admin chat fallback processing:', dbErr);
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  }
};
