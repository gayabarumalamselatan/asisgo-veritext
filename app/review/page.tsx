"use client";

import { useEffect, useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { ReviewAndDecision } from "@/components/review-decision";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReviewPage() {
  const { workflow, initializeWorkflow } = useVerification();
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
                  Review & Decision
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
          <h2 className="text-3xl font-bold mb-2">Review & Decision</h2>
          <p className="text-muted-foreground">
            Make informed decisions based on verification results, then export
            audit trails and reports.
          </p>
        </div>

        {workflow.documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No documents available for review.
            </p>
            <Link href="/extract">
              <Button>Start Extraction</Button>
            </Link>
          </div>
        ) : (
          <>
            <ReviewAndDecision onComplete={() => {}} />
            <div className="mt-8 flex gap-3">
              <Link href="/complete">
                <Button>Complete & Export</Button>
              </Link>
              <Link href="/insights">
                <Button variant="outline">Back to Insights</Button>
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
