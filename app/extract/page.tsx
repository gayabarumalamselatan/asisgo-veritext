"use client";

import { useEffect, useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentExtraction } from "@/components/document-extraction";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ExtractPage() {
  const { workflow, initializeWorkflow } = useVerification();
  const [showExtraction, setShowExtraction] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!workflow) {
      initializeWorkflow();
    }
  }, [workflow, initializeWorkflow]);

  if (!mounted || !workflow) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-primary">Veritext</h1>
                <p className="text-xs text-muted-foreground">
                  Document Extraction
                </p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Document Extraction</h2>
          <p className="text-muted-foreground">
            Extract and scan documents using OCR technology. Upload documents
            and extract key information, entities, and metadata.
          </p>
        </div>

        {/* Upload Section */}
        {!showExtraction && (
          <DocumentUpload onProceedExtraction={() => setShowExtraction(true)} />
        )}

        {/* Extraction Section */}
        {showExtraction && workflow.documents.length > 0 && (
          <>
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                Extracting from <strong>{workflow.documents.length}</strong>{" "}
                document(s).
              </p>
            </div>

            <DocumentExtraction onComplete={() => {}} />

            <div className="mt-8 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExtraction(false)}
              >
                Back to Upload
              </Button>
              <Link href="/compare">
                <Button>Next: Compare Documents</Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-muted-foreground">
            Veritext &copy; 2026 - AI-Powered Document Verification &
            Intelligence Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
