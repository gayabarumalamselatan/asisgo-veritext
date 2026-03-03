'use client';

import { useState } from 'react';
import { useVerification } from '@/lib/verification-context';
import { Insight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InsightsProps {
  onComplete?: () => void;
}

export function DocumentInsights({ onComplete }: InsightsProps) {
  const { workflow, setInsights, moveToStep } = useVerification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setLocalInsights] = useState<Map<string, Insight>>(new Map());

  const handleGenerateInsights = async (documentId: string) => {
    const extracted = workflow?.extracted.find((e) => e.documentId === documentId);
    if (!extracted) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted, documentId }),
      });

      const result = await response.json();
      if (result.success) {
        const insight: Insight = {
          id: `insight-${documentId}-${Date.now()}`,
          documentId,
          ...result.data,
        };

        setInsights(documentId, insight);
        setLocalInsights((prev) => new Map(prev).set(documentId, insight));
      }
    } catch (error) {
      console.error('Insight generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!workflow?.documents.length) return;
    setIsProcessing(true);

    for (const doc of workflow.documents) {
      await handleGenerateInsights(doc.id);
    }

    setIsProcessing(false);
  };

  const handleProceedToReview = () => {
    if (insights.size === workflow?.documents.length) {
      moveToStep('review');
      onComplete?.();
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-6">Document Intelligence & Insights</h3>

      <div className="mb-6">
        <Button
          onClick={handleGenerateAll}
          disabled={isProcessing || !workflow?.documents.length}
          className="w-full"
        >
          {isProcessing ? 'Generating Insights...' : `Generate Insights for All (${workflow?.documents.length})`}
        </Button>
      </div>

      <div className="space-y-6">
        {workflow?.documents.map((doc) => {
          const insight = insights.get(doc.id);

          return (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {insight ? 'Analysis complete' : 'Pending analysis'}
                  </p>
                </div>
                {insight && <div className="text-sm text-accent font-medium">✓ Done</div>}
              </div>

              {insight ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground">{insight.summary}</p>
                  </div>

                  {/* Key Findings */}
                  {insight.keyFindings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">KEY FINDINGS</p>
                      <div className="space-y-2">
                        {insight.keyFindings.map((finding, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-accent font-bold">•</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patterns */}
                  {insight.patterns.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">IDENTIFIED PATTERNS</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.patterns.map((pattern, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-primary/10 text-primary dark:bg-primary/20 px-3 py-1 rounded-full font-medium"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anomalies */}
                  {insight.anomalies.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">DETECTED ANOMALIES</p>
                      <div className="space-y-2">
                        {insight.anomalies.map((anomaly, idx) => (
                          <div key={idx} className={`p-3 rounded-lg border ${getRiskBg(anomaly.riskLevel)}`}>
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs font-semibold uppercase">{anomaly.field}</span>
                              <span className={`text-xs font-bold ${getRiskColor(anomaly.riskLevel)}`}>
                                {anomaly.riskLevel.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-foreground">{anomaly.description}</p>
                            {anomaly.value && (
                              <p className="text-xs text-muted-foreground mt-1">Value: {anomaly.value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {insight.riskFactors.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">RISK FACTORS</p>
                      <div className="space-y-1">
                        {insight.riskFactors.map((factor, idx) => (
                          <div key={idx} className="flex gap-2 text-sm">
                            <span className="text-red-600 dark:text-red-400">⚠</span>
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateInsights(doc.id)}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  Generate Insights
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {insights.size === workflow?.documents.length && workflow?.documents.length! > 0 && (
        <Button
          onClick={handleProceedToReview}
          className="w-full mt-6"
        >
          Proceed to Review & Decision
        </Button>
      )}
    </div>
  );
}
