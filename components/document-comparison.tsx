"use client";

import { useState } from "react";
import { useVerification } from "@/lib/verification-context";
import { Comparison, DifferenceItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ComparisonProps {
  onComplete?: () => void;
}

export function DocumentComparison({ onComplete }: ComparisonProps) {
  const { workflow, setComparison, moveToStep } = useVerification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisons, setComparisons] = useState<Map<string, Comparison>>(
    new Map(),
  );
  const [selectedComparisonId, setSelectedComparisonId] = useState<
    string | null
  >(null);

  const handleCompareDocuments = async (doc1Id: string, doc2Id: string) => {
    const doc1 = workflow?.documents.find((d) => d.id === doc1Id);
    const doc2 = workflow?.documents.find((d) => d.id === doc2Id);
    const ext1 = workflow?.extracted.find((e) => e.documentId === doc1Id);
    const ext2 = workflow?.extracted.find((e) => e.documentId === doc2Id);

    if (!doc1 || !doc2 || !ext1 || !ext2) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content1: doc1.content,
          content2: doc2.content,
          extracted1: ext1,
          extracted2: ext2,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const comparison: Comparison = {
          id: `comparison-${doc1Id}-${doc2Id}-${Date.now()}`,
          document1Id: doc1Id,
          document2Id: doc2Id,
          ...result.data,
        };

        setComparison(comparison);
        setComparisons((prev) => {
          const key = `${doc1Id}-${doc2Id}`;
          return new Map(prev).set(key, comparison);
        });
        setSelectedComparisonId(`${doc1Id}-${doc2Id}`);
      }
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCompliance = () => {
    if (comparisons.size > 0) {
      moveToStep("compliance");
      onComplete?.();
    }
  };

  const renderSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      major:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      minor:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${colors[severity as keyof typeof colors]}`}
      >
        {severity.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h3 className="text-lg font-semibold mb-6">
        Document Comparison (Jika Revisi)
      </h3>

      {workflow && workflow.documents.length > 1 ? (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h4 className="font-semibold mb-4">Select Documents to Compare</h4>
            <div className="grid grid-cols-2 gap-4">
              {workflow.documents.map((doc1, i) => (
                <div key={doc1.id}>
                  {workflow.documents.map((doc2, j) => {
                    if (i >= j) return null;
                    const key = `${doc1.id}-${doc2.id}`;
                    const isCompared = comparisons.has(key);

                    return (
                      <Button
                        key={key}
                        onClick={() => handleCompareDocuments(doc1.id, doc2.id)}
                        disabled={isProcessing}
                        variant={isCompared ? "default" : "outline"}
                        className="w-full mb-2 justify-start text-left hover:cursor-pointer"
                      >
                        <span className="truncate">
                          {doc1.name} vs {doc2.name}
                        </span>
                        {isCompared && <span className="ml-auto">✓</span>}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {comparisons.size > 0 && (
            <div className="space-y-4">
              {Array.from(comparisons.values()).map((comparison) => (
                <Card
                  key={comparison.id}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    setSelectedComparisonId(
                      `${comparison.document1Id}-${comparison.document2Id}`,
                    )
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        {
                          workflow.documents.find(
                            (d) => d.id === comparison.document1Id,
                          )?.name
                        }{" "}
                        vs{" "}
                        {
                          workflow.documents.find(
                            (d) => d.id === comparison.document2Id,
                          )?.name
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {comparison.summary}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {comparison.similarity.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Similarity
                      </p>
                    </div>
                  </div>

                  {selectedComparisonId ===
                    `${comparison.document1Id}-${comparison.document2Id}` && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {comparison.differences.map((diff, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/50 p-3 rounded text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{diff.field}</span>
                            <div className="flex items-center gap-2">
                              {renderSeverityBadge(diff.severity)}
                              {diff.detected && (
                                <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded font-semibold">
                                  POTENTIAL MANIPULATION
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Document 1
                              </p>
                              <p className="text-sm text-foreground">
                                {diff.document1Value || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Document 2
                              </p>
                              <p className="text-sm text-foreground">
                                {diff.document2Value || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {comparisons.size > 0 && (
            <Button
              onClick={handleProceedToCompliance}
              className="w-full mt-6 hover:cursor-pointer"
            >
              Proceed to Compliance Check
            </Button>
          )}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Upload at least 2 documents to compare them.
          </p>
        </Card>
      )}
    </div>
  );
}
