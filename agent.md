# Developer Agent log (`agent.md`)

This file serves as the core reference for requirements, specifications, design rationale, and development guidelines for the **AI Customer Support SaaS** project.

---

## 1. Requirement Documents

### V1.0 MVP Core Requirements
* **Multi-Format Document Upload**: Support for PDF, DOCX, and TXT files.
* **Vector Search Engine**: Store and query chunks of the uploaded documents.
* **Strict RAG Answers**: The AI must answer queries using *only* the contents of the uploaded documents (strict response policy, zero hallucinations).
* **Escalation Fallback**: Provide configured company support information (email, phone, working hours, etc.) if the answer is not present in the documentation.
* **JWT Authentication**: Register, Login, and User Profile management.
* **Admin Dashboard**: Overview of document count, total chats, and recent support conversations.

---

## 2. Specification Files

### Project Directory Structure (Monorepo)
```text
customer_support-ai-saas/
├── client/                 # Next.js Frontend (TypeScript, Tailwind v4)
├── server/                 # Express Backend (TypeScript, Node)
├── docs/                   # API Specifications and Schemas
├── agent.md                # This file (Agent log and design system)
└── AI_Customer_Support_SaaS_Roadmap.md # Project Roadmap
```

### Technical Specs
* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS v4.0.
* **Backend**: Node.js, Express, TypeScript, Mongoose.
* **Database**: MongoDB Atlas (Free Shared Cluster) utilizing built-in **Atlas Vector Search**.
* **LLM Engine**:
  * **Development**: Local Ollama (running Llama 3 or similar, with `nomic-embed-text` embeddings).
  * **Production**: Google Gemini API (Gemini 1.5/2.0 Flash) for cost-free cloud execution.
* **Vector Vector Space**: 768-dimensional vectors (or matched to the active embedding model dimensions).

---

## 3. Design Rationale

### Choice of Frontend Framework: Next.js
* **Why**: Next.js is the React standard, offering superior performance, built-in routing, API routes, and Server Components. Combining Next.js with AWS Amplify provides simple, reliable CI/CD pipelines.

### Choice of Styling: Tailwind CSS v4.0
* **Why**: Tailwind CSS v4 introduces Lightning CSS compilation (significantly faster builds) and a CSS-first configuration approach, eliminating configuration bloat (no `tailwind.config.js` required).

### Choice of Backend Hosting: AWS EC2
* **Why**: An Express backend running on an EC2 instance provides a persistent process that runs 24/7 without cold starts or sleeping. This is crucial for future features on the roadmap such as persistent WebSockets (Socket.io) and background job processing queues (BullMQ/Redis).

### Choice of Vector Database: MongoDB Atlas Vector Search
* **Why**: Atlas has vector search capabilities natively integrated. It avoids the need to configure and sync a secondary database (like Pinecone), lowering latency, minimizing deployment steps, and staying completely free on the M0 tier.

### LLM Cost Optimization Strategy
* **Why**: Hosting a self-hosted LLM on AWS EC2 is expensive because it requires a dedicated GPU instance. To keep this personal project 100% free to run in production, we use **Ollama locally** during development and shift to **Google's Gemini API free tier** for the deployed app.
