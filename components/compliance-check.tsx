"use client";

import { useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { ComplianceResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ComplianceCheckProps {
  onComplete?: () => void;
}

export function ComplianceCheck({ onComplete }: ComplianceCheckProps) {
  const { workflow, setComplianceResults, moveToStep } = useVerification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ComplianceResult[]>([]);

  const handleRunCompliance = async () => {
    if (!workflow?.extracted.length) return;

    setIsProcessing(true);
    try {
      const allResults: ComplianceResult[] = [];

      for (const extracted of workflow.extracted) {
        const response = await fetch("/api/compliance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extracted,
            documentId: extracted.documentId,
          }),
        });

        const result = await response.json();
        if (result.success) {
          allResults.push(...result.data);
        }
      }

      setResults(allResults);
      setComplianceResults(allResults);
    } catch (error) {
      console.error("Compliance check failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToInsights = () => {
    moveToStep("insights");
    onComplete?.();
  };

  const severityColors = {
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    success:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  };

  const severityIcons = {
    error: "✕",
    warning: "⚠",
    info: "ℹ",
    success: "✓",
  };

  const severityTextColors = {
    error: "text-red-700 dark:text-red-200",
    warning: "text-yellow-700 dark:text-yellow-200",
    info: "text-blue-700 dark:text-blue-200",
    success: "text-green-700 dark:text-green-200",
  };

  const errorCount = results.filter(
    (r) => r.severity === "error" && !r.passed,
  ).length;
  const warningCount = results.filter(
    (r) => r.severity === "warning" && !r.passed,
  ).length;
  const passCount = results.filter((r) => r.passed).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-6">Compliance Check</h3>

      {results.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground mb-4">
            Run compliance checks against predefined rules and standards
          </p>
          <Button
            onClick={handleRunCompliance}
            disabled={isProcessing || !workflow?.extracted.length}
            className="px-6 hover:cursor-pointer"
          >
            {isProcessing ? "Running Checks..." : "Run Compliance Check"}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                {passCount}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 font-semibold">
                PASSED
              </p>
            </Card>
            <Card className="p-4 text-center bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
                {warningCount}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 font-semibold">
                WARNINGS
              </p>
            </Card>
            <Card className="p-4 text-center bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <p className="text-2xl font-bold text-red-700 dark:text-red-200">
                {errorCount}
              </p>
              <p className="text-xs text-red-600 dark:text-red-300 font-semibold">
                ERRORS
              </p>
            </Card>
          </div>

          {/* Results by Document */}
          {workflow?.documents.map((doc) => {
            const docResults = results.filter((r) => r.documentId === doc.id);
            return (
              <Card key={doc.id} className="p-6">
                <h4 className="font-semibold mb-4">{doc.name}</h4>
                <div className="space-y-3">
                  {docResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border ${
                        result.passed
                          ? severityColors.success
                          : severityColors[result.severity]
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`text-lg font-bold mt-0.5 ${
                            result.passed
                              ? severityTextColors.success
                              : severityTextColors[result.severity]
                          }`}
                        >
                          {result.passed
                            ? severityIcons.success
                            : severityIcons[result.severity]}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {result.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rule: {result.ruleId}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            result.passed
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : result.severity === "error"
                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          }`}
                        >
                          {result.passed ? "PASS" : "FAIL"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          <div className="flex gap-3">
            <Button
              onClick={handleRunCompliance}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 hover:cursor-pointer"
            >
              Re-run Checks
            </Button>
            <Button
              onClick={handleProceedToInsights}
              className="flex-1 hover:cursor-pointer"
            >
              Proceed to Insights
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
