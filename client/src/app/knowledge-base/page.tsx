'use client';

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';

interface DocumentInfo {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDroppingRef = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.get('/documents');
      setDocs(data);
    } catch (err) {
      setError('Failed to fetch documents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    isDroppingRef.current = true;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
    setTimeout(() => {
      isDroppingRef.current = false;
    }, 150);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      setError('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadStatus('Uploading file...');
      
      // Call upload API
      await api.upload('/documents/upload', file);
      
      setUploadStatus('Success! Chunking and indexing vector embeddings...');
      setTimeout(() => {
        setUploadStatus('');
        setUploading(false);
        fetchDocuments();
      }, 1000);
      
    } catch (err) {
      setError((err as Error).message || 'Failed to upload document.');
      setUploading(false);
      setUploadStatus('');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      await api.delete(`/documents/${id}`);
      setDeleteConfirmId(null);
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document.');
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Knowledge Base
          </h1>
          <p className="text-slate-550 text-sm mt-1">
            Upload text materials to ground the AI support assistant. Supported types: PDF, DOCX, TXT.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-650 text-xs flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(e) => {
            if (uploading) return;
            if (isDroppingRef.current) return;
            fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 mb-8 ${
            uploading 
              ? 'border-indigo-500 bg-indigo-50 cursor-wait' 
              : isDragging
                ? 'border-indigo-500 bg-indigo-100/50 scale-[1.01] shadow-md'
                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 bg-white shadow-sm'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
            disabled={uploading}
          />
          
          <div className="pointer-events-none flex flex-col items-center justify-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-indigo-650" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm font-bold text-indigo-600 animate-pulse">{uploadStatus}</p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Drag & Drop files here</h3>
                <p className="text-slate-550 text-xs max-w-xs">
                  or click to browse from files. Maximum size: 10MB (PDF, DOCX, TXT).
                </p>
              </>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Uploaded Knowledge Base Files</h2>
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : docs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              No files are added to the knowledge base yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-550 font-semibold uppercase tracking-wider">
                    <th className="py-3 pr-4">File Name</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Uploaded At</th>
                    <th className="py-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docs.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/80 group">
                      <td className="py-4 pr-4 font-semibold text-slate-700 truncate max-w-xs">
                        {doc.originalName}
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {formatSize(doc.size)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 uppercase">
                          {doc.originalName.split('.').pop() || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {deleteConfirmId === doc._id ? (
                          <div className="inline-flex gap-2">
                            <button
                               onClick={() => handleDelete(doc._id)}
                              className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition font-semibold text-[10px] cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-100 text-slate-750 hover:bg-slate-200 transition font-semibold text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(doc._id)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-655 transition cursor-pointer shadow-sm"
                            title="Delete file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
