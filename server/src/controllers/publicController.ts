import { Request, Response } from 'express';
import { Chat } from '../models/Chat.js';
import { SupportConfig } from '../models/SupportConfig.js';
import { Company } from '../models/Company.js';
import { retrieveContext } from '../services/ragService.js';
import { generateChatResponseStream, condenseSearchQuery } from '../services/aiService.js';
import mongoose from 'mongoose';

export const getPublicSupportConfig = async (req: Request, res: Response) => {
  const { companyId } = req.query;

  try {
    if (!companyId) {
      return res.status(400).json({ message: 'companyId is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId as string)) {
      return res.status(400).json({ message: 'Invalid companyId format.' });
    }

    const config = await SupportConfig.findOne({ companyId: new mongoose.Types.ObjectId(companyId as string) });
    if (!config) {
      // Find the company to serve a graceful fallback config
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Workspace / Company not found.' });
      }

      // Return a graceful default configuration to prevent front-end crashes
      return res.status(200).json({
        companyId: company._id,
        companyName: company.name,
        supportEmail: 'support@example.com',
        workingHours: '9:00 AM - 5:00 PM (Mon-Fri)',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return res.status(200).json(config);
  } catch (error) {
    console.error('Get public support config error:', error);
    return res.status(500).json({ message: 'Server error fetching support config.' });
  }
};

export const createPublicChatSession = async (req: Request, res: Response) => {
  const { companyId } = req.body;

  try {
    if (!companyId) {
      return res.status(400).json({ message: 'companyId is required.' });
    }

    const chat = await Chat.create({
      title: 'Guest Conversation',
      companyId: new mongoose.Types.ObjectId(companyId),
      messages: []
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error('Create public chat session error:', error);
    return res.status(500).json({ message: 'Server error creating public chat session.' });
  }
};

export const getPublicChatSession = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    return res.status(200).json(chat);
  } catch (error) {
    console.error('Get public chat session error:', error);
    return res.status(500).json({ message: 'Server error fetching chat.' });
  }
};

export const sendPublicMessage = async (req: Request, res: Response) => {
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

    const companyIdStr = chat.companyId?.toString();

    // Condense user query using recent chat history
    const recentHistory = chat.messages.slice(-5);
    const condensedQuery = await condenseSearchQuery(text, recentHistory);

    // 1. Retrieve context using the search-optimized query
    const contexts = await retrieveContext(condensedQuery, 4, companyIdStr);

    // 2. Fetch Support config for the company
    let support = await SupportConfig.findOne({ companyId: chat.companyId });
    if (!support) {
      support = new SupportConfig({
        companyName: 'Support Assistant',
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
5. Do NOT include, mention, or output any source names, document filenames, or citations (such as "[Source X]" or "(Source: ...)") in your response. Answer in natural, clean sentences only.

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
      citations: contexts.length > 0 ? citations : [],
      createdAt: new Date()
    };

    chat.messages.push(userMsg);
    chat.messages.push(assistantMsg);

    if (chat.messages.length <= 2 && chat.title === 'Guest Conversation') {
      chat.title = text.length > 40 ? text.substring(0, 40) + '...' : text;
    }

    await chat.save();

    // Signal completion
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error generating and streaming public chat reply:', error);
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
};

export const submitPublicFeedback = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { feedback } = req.body;

  try {
    if (!['helpful', 'not_helpful'].includes(feedback)) {
      return res.status(400).json({ message: 'Invalid feedback value. Must be "helpful" or "not_helpful".' });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat session not found.' });
    }

    chat.feedback = feedback;
    await chat.save();

    return res.status(200).json({ message: 'Feedback recorded successfully.', feedback: chat.feedback });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(550).json({ message: 'Server error saving feedback.' });
  }
};
