'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { VerificationWorkflow, Document, ExtractedContent, Comparison, ComplianceResult, Insight, VerificationResult, AuditTrail } from './types';

interface VerificationContextType {
  workflow: VerificationWorkflow | null;
  initializeWorkflow: () => void;
  addDocument: (file: File) => void;
  removeDocument: (documentId: string) => void;
  setExtractedContent: (documentId: string, content: ExtractedContent) => void;
  setComparison: (comparison: Comparison) => void;
  setComplianceResults: (results: ComplianceResult[]) => void;
  setInsights: (documentId: string, insights: Insight) => void;
  setVerificationResult: (result: VerificationResult) => void;
  addAuditTrail: (audit: Omit<AuditTrail, 'id'>) => void;
  exportData: () => string;
  getCurrentStep: () => string;
  moveToStep: (step: VerificationWorkflow['currentStep']) => void;
  clearWorkflow: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflow, setWorkflow] = useState<VerificationWorkflow | null>(null);

  const initializeWorkflow = useCallback(() => {
    const newWorkflow: VerificationWorkflow = {
      id: `workflow-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      currentStep: 'upload',
      documents: [],
      extracted: [],
      comparisons: [],
      compliance: [],
      insights: [],
      verification: {
        id: '',
        documentId: '',
        verifiedAt: new Date(),
        status: 'pending',
        decision: '',
        verifiedBy: '',
        notes: '',
      },
      auditTrail: [],
    };
    setWorkflow(newWorkflow);
  }, []);

  const addDocument = useCallback((file: File) => {
    if (!workflow) return;

    // For XLSX files, read as ArrayBuffer; for others, read as Text
    if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = String.fromCharCode(...uint8Array);
        const newDoc: Document = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSize: file.size,
          uploadedAt: new Date(),
          content: binaryString,
          metadata: {
            language: 'en',
            quality: 'high',
          },
        };

        setWorkflow((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            documents: [...prev.documents, newDoc],
            updatedAt: new Date(),
          };
        });

        addAuditTrail({
          action: 'DOCUMENT_UPLOADED',
          documentId: newDoc.id,
          timestamp: new Date(),
          userId: 'system',
          changes: [],
          details: `Uploaded document: ${file.name}`,
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newDoc: Document = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.type || 'text/plain',
          fileSize: file.size,
          uploadedAt: new Date(),
          content,
          metadata: {
            language: 'en',
            quality: 'high',
          },
        };

        setWorkflow((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            documents: [...prev.documents, newDoc],
            updatedAt: new Date(),
          };
        });

        addAuditTrail({
          action: 'DOCUMENT_UPLOADED',
          documentId: newDoc.id,
          timestamp: new Date(),
          userId: 'system',
          changes: [],
          details: `Uploaded document: ${file.name}`,
        });
      };
      reader.readAsText(file);
    }
  }, [workflow]);

  const removeDocument = useCallback((documentId: string) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: prev.documents.filter((d) => d.id !== documentId),
        extracted: prev.extracted.filter((e) => e.documentId !== documentId),
        updatedAt: new Date(),
      };
    });
  }, []);

  const setExtractedContent = useCallback((documentId: string, content: ExtractedContent) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.extracted.findIndex((e) => e.documentId === documentId);
      const updated = existingIndex >= 0 
        ? [...prev.extracted.slice(0, existingIndex), content, ...prev.extracted.slice(existingIndex + 1)]
        : [...prev.extracted, content];
      
      return {
        ...prev,
        extracted: updated,
        updatedAt: new Date(),
      };
    });
  }, []);

  const setComparison = useCallback((comparison: Comparison) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.comparisons.findIndex(
        (c) => c.document1Id === comparison.document1Id && c.document2Id === comparison.document2Id
      );
      const updated = existingIndex >= 0
        ? [...prev.comparisons.slice(0, existingIndex), comparison, ...prev.comparisons.slice(existingIndex + 1)]
        : [...prev.comparisons, comparison];

      return {
        ...prev,
        comparisons: updated,
        updatedAt: new Date(),
      };
    });
  }, []);

  const setComplianceResults = useCallback((results: ComplianceResult[]) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        compliance: results,
        updatedAt: new Date(),
      };
    });
  }, []);

  const setInsights = useCallback((documentId: string, insights: Insight) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.insights.findIndex((i) => i.documentId === documentId);
      const updated = existingIndex >= 0
        ? [...prev.insights.slice(0, existingIndex), insights, ...prev.insights.slice(existingIndex + 1)]
        : [...prev.insights, insights];

      return {
        ...prev,
        insights: updated,
        updatedAt: new Date(),
      };
    });
  }, []);

  const setVerificationResult = useCallback((result: VerificationResult) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        verification: result,
        updatedAt: new Date(),
      };
    });
  }, []);

  const addAuditTrail = useCallback((audit: Omit<AuditTrail, 'id'>) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      const newAudit: AuditTrail = {
        ...audit,
        id: `audit-${Date.now()}`,
      };
      return {
        ...prev,
        auditTrail: [...prev.auditTrail, newAudit],
        updatedAt: new Date(),
      };
    });
  }, []);

  const getCurrentStep = useCallback(() => {
    return workflow?.currentStep || 'upload';
  }, [workflow]);

  const moveToStep = useCallback((step: VerificationWorkflow['currentStep']) => {
    setWorkflow((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentStep: step,
        updatedAt: new Date(),
      };
    });
  }, []);

  const exportData = useCallback(() => {
    if (!workflow) return '';
    return JSON.stringify(workflow, null, 2);
  }, [workflow]);

  const clearWorkflow = useCallback(() => {
    setWorkflow(null);
  }, []);

  const value: VerificationContextType = {
    workflow,
    initializeWorkflow,
    addDocument,
    removeDocument,
    setExtractedContent,
    setComparison,
    setComplianceResults,
    setInsights,
    setVerificationResult,
    addAuditTrail,
    exportData,
    getCurrentStep,
    moveToStep,
    clearWorkflow,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider');
  }
  return context;
};
