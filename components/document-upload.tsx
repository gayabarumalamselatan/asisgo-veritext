'use client';

import { useRef, useState } from 'react';
import { useVerification } from '@/lib/verification-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DocumentUploadProps {
  onComplete?: () => void;
}

export function DocumentUpload({ onComplete }: DocumentUploadProps) {
  const { workflow, addDocument, moveToStep } = useVerification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isText = file.type.includes('text');
      const isPdf = file.type === 'application/pdf';
      const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
      const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     file.name.endsWith('.xlsx');
      
      if (isText || isPdf || isCsv || isXlsx) {
        setIsProcessing(true);
        addDocument(file);
        setTimeout(() => setIsProcessing(false), 500);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleProceed = () => {
    if (workflow && workflow.documents.length > 0) {
      moveToStep('extract');
      onComplete?.();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }
          `}
        >
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your documents here or click to browse
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Select Files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.doc,.docx,.csv,.xlsx"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: TXT, PDF, DOC, DOCX, CSV, XLSX
          </p>
        </div>

        {workflow && workflow.documents.length > 0 && (
          <div className="mt-8">
            <h4 className="font-semibold mb-4">Uploaded Documents ({workflow.documents.length})</h4>
            <div className="space-y-2 mb-6">
              {workflow.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="text-xs text-accent">Ready</div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleProceed}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Extraction'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
