"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVerification } from "@/lib/verification-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReviewProps {
  onComplete?: () => void;
}

export function ReviewAndDecision({ onComplete }: ReviewProps) {
  const { workflow, setVerificationResult, addAuditTrail } = useVerification();
  const router = useRouter();
  const [selectedDecision, setSelectedDecision] = useState<
    "approved" | "rejected" | "flagged" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDecision = async () => {
    if (!workflow || !selectedDecision) return;

    setIsSubmitting(true);
    try {
      // Record the decision
      const verificationResult = {
        id: `verification-${workflow.id}-${Date.now()}`,
        documentId: workflow.documents[0]?.id || "",
        verifiedAt: new Date(),
        status: selectedDecision as any,
        decision: selectedDecision.toUpperCase(),
        verifiedBy: "Current User",
        notes,
      };

      setVerificationResult(verificationResult);

      // Add audit trail
      addAuditTrail({
        action: "VERIFICATION_DECISION_RECORDED",
        documentId: workflow.documents[0]?.id || "",
        timestamp: new Date(),
        userId: "system",
        changes: [
          {
            field: "verification_status",
            oldValue: "pending",
            newValue: selectedDecision,
          },
        ],
        details: `Verification decision: ${selectedDecision}. Notes: ${notes || "None"}`,
      });

      // Move to completion
      router.push("/complete");
      onComplete?.();
    } catch (error) {
      console.error("Decision submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const decisionOptions = [
    {
      id: "approved",
      title: "Approve",
      description: "Documents verified and approved for processing",
      color: "border-green-500 bg-green-50 dark:bg-green-950",
      textColor: "text-green-700 dark:text-green-200",
      icon: "✓",
    },
    {
      id: "flagged",
      title: "Flag for Review",
      description: "Documents contain issues requiring manual review",
      color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
      textColor: "text-yellow-700 dark:text-yellow-200",
      icon: "⚠",
    },
    {
      id: "rejected",
      title: "Reject",
      description: "Documents do not meet verification standards",
      color: "border-red-500 bg-red-50 dark:bg-red-950",
      textColor: "text-red-700 dark:text-red-200",
      icon: "✕",
    },
  ];

  // Summary stats
  const errorCount =
    workflow?.compliance.filter((c) => c.severity === "error" && !c.passed)
      .length || 0;
  const warningCount =
    workflow?.compliance.filter((c) => c.severity === "warning" && !c.passed)
      .length || 0;
  const anomalyCount =
    workflow?.insights.flatMap((i) => i.anomalies).length || 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-6">User Review & Decision</h3>

      {/* Summary Dashboard */}
      <Card className="p-6 mb-6">
        <h4 className="font-semibold mb-4">Verification Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {workflow?.documents.length}
            </p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {errorCount}
            </p>
            <p className="text-xs text-muted-foreground">Critical Issues</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {warningCount}
            </p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {anomalyCount}
            </p>
            <p className="text-xs text-muted-foreground">Anomalies</p>
          </div>
        </div>
      </Card>

      {/* Document Details */}
      <Card className="p-6 mb-6">
        <h4 className="font-semibold mb-4">Verified Documents</h4>
        <div className="space-y-3">
          {workflow?.documents.map((doc) => {
            const docInsights = workflow.insights.find(
              (i) => i.documentId === doc.id,
            );
            const docCompliance = workflow.compliance.filter(
              (c) => c.documentId === doc.id,
            );
            const criticalIssues = docCompliance.filter(
              (c) => c.severity === "error" && !c.passed,
            ).length;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {criticalIssues > 0 &&
                      `${criticalIssues} critical issue${criticalIssues > 1 ? "s" : ""}`}
                    {docInsights?.anomalies.length
                      ? `, ${docInsights.anomalies.length} anomalies`
                      : ""}
                  </p>
                </div>
                <div
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    criticalIssues > 0
                      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  }`}
                >
                  {criticalIssues > 0 ? "ISSUES" : "OK"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Decision Options */}
      <Card className="p-6 mb-6">
        <h4 className="font-semibold mb-4">Make Your Decision</h4>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {decisionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedDecision(option.id as any)}
              className={`
                p-4 border-2 rounded-lg transition-all cursor-pointer text-left
                ${
                  selectedDecision === option.id
                    ? `${option.color} border-2 ring-2 ring-offset-2 ring-primary`
                    : `border-gray-200 dark:border-gray-700 hover:${option.color}`
                }
              `}
            >
              <div className={`text-2xl font-bold mb-2 ${option.textColor}`}>
                {option.icon}
              </div>
              <p className="font-semibold text-sm">{option.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional comments or observations about this verification..."
            className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
        </div>

        <Button
          onClick={handleSubmitDecision}
          disabled={!selectedDecision || isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Submitting..." : "Submit Decision & Continue"}
        </Button>
      </Card>
    </div>
  );
}
