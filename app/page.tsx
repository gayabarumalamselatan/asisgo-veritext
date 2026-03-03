"use client";

import { useEffect, useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { WorkflowProgress } from "@/components/workflow-progress";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentExtraction } from "@/components/document-extraction";
import { DocumentComparison } from "@/components/document-comparison";
import { ComplianceCheck } from "@/components/compliance-check";
import { DocumentInsights } from "@/components/document-insights";
import { ReviewAndDecision } from "@/components/review-decision";
import { AuditTrailAndExport } from "@/components/audit-trail";

const steps = [
  { id: "upload", label: "Upload", description: "Document Input" },
  { id: "extract", label: "Extract", description: "OCR & Extraction" },
  { id: "compare", label: "Compare", description: "Jika Revisi" },
  { id: "compliance", label: "Compliance", description: "Check Rules" },
  { id: "insights", label: "Insights", description: "Intelligence" },
  { id: "review", label: "Review", description: "Decision" },
  { id: "complete", label: "Complete", description: "Audit & Export" },
];

export default function Home() {
  const { workflow, initializeWorkflow, moveToStep, clearWorkflow } =
    useVerification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!workflow) {
      initializeWorkflow();
    }
  }, [workflow, initializeWorkflow]);

  if (!mounted || !workflow) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(
    (s) => s.id === workflow.currentStep,
  );
  const isCompleted = workflow.currentStep === "complete";

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-card">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-8 h-8"
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
                  Veritext
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Document Verification & Intelligence Platform
              </p>
            </div>
            {!isCompleted && (
              <button
                onClick={() => {
                  clearWorkflow();
                  initializeWorkflow();
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset Workflow
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Workflow Progress */}
      {!isCompleted && (
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <WorkflowProgress
              steps={steps}
              currentStep={workflow.currentStep}
              onStepClick={(step) => {
                const stepIndex = steps.findIndex((s) => s.id === step);
                const currentIndex = steps.findIndex(
                  (s) => s.id === workflow.currentStep,
                );
                if (stepIndex <= currentIndex) {
                  moveToStep(step as any);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Upload Step */}
        {workflow.currentStep === "upload" && (
          <DocumentUpload onComplete={() => console.log("Upload complete")} />
        )}

        {/* Extraction Step */}
        {workflow.currentStep === "extract" && (
          <DocumentExtraction
            onComplete={() => console.log("Extraction complete")}
          />
        )}

        {/* Comparison Step */}
        {workflow.currentStep === "compare" && (
          <DocumentComparison
            onComplete={() => console.log("Comparison complete")}
          />
        )}

        {/* Compliance Step */}
        {workflow.currentStep === "compliance" && (
          <ComplianceCheck
            onComplete={() => console.log("Compliance complete")}
          />
        )}

        {/* Insights Step */}
        {workflow.currentStep === "insights" && (
          <DocumentInsights
            onComplete={() => console.log("Insights complete")}
          />
        )}

        {/* Review Step */}
        {workflow.currentStep === "review" && (
          <ReviewAndDecision
            onComplete={() => console.log("Review complete")}
          />
        )}

        {/* Completion Step */}
        {workflow.currentStep === "complete" && (
          <AuditTrailAndExport
            onNewWorkflow={() => {
              clearWorkflow();
              initializeWorkflow();
            }}
          />
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
