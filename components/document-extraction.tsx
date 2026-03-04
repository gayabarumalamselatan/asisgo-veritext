"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVerification } from "@/lib/verification-context";
import { ExtractedContent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExtractionProps {
  onComplete?: () => void;
}

export function DocumentExtraction({ onComplete }: ExtractionProps) {
  const { workflow, setExtractedContent } = useVerification();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedDocuments, setExtractedDocuments] = useState<
    Map<string, ExtractedContent>
  >(new Map());

  const handleExtractDocument = async (documentId: string) => {
    const doc = workflow?.documents.find((d) => d.id === documentId);
    if (!doc) return;

    setIsProcessing(true);
    try {
      // Determine file type
      let fileType = "text";
      if (doc.name.endsWith(".csv")) fileType = "csv";
      if (doc.name.endsWith(".xlsx")) fileType = "xlsx";

      const formData = new FormData();

      // For XLSX files, handle binary data differently
      let fileToSend: Blob;
      if (fileType === "xlsx") {
        // Convert binary string back to Blob for XLSX
        const binaryString = doc.content;
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileToSend = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        // For text and CSV, use content directly
        fileToSend = new Blob([doc.content], { type: doc.type });
      }

      const blobFile = new File([fileToSend], doc.name, { type: doc.type });
      formData.append("file", blobFile);
      formData.append("fileType", fileType);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const extracted: ExtractedContent = {
          id: `extracted-${documentId}-${Date.now()}`,
          documentId,
          ...result.data,
        };

        setExtractedContent(documentId, extracted);
        setExtractedDocuments((prev) =>
          new Map(prev).set(documentId, extracted),
        );
      } else {
        console.error("Extraction error:", result.details);
      }
    } catch (error) {
      console.error("[v0] Extraction failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractAll = async () => {
    if (!workflow) return;
    setIsProcessing(true);

    for (const doc of workflow.documents) {
      await handleExtractDocument(doc.id);
    }

    setIsProcessing(false);
  };

  const handleExportOCR = (extracted: ExtractedContent, docName: string) => {
    // Create a formatted export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      documentName: docName,
      extraction: {
        confidence: extracted.confidence,
        keyInformation: extracted.keyInformation,
        entities: extracted.entities,
        rawText: extracted.rawText,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`,
    );
    element.setAttribute(
      "download",
      `ocr-extraction-${docName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${Date.now()}.json`,
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleProceedToComparison = () => {
    if (workflow && extractedDocuments.size === workflow.documents.length) {
      router.push("/compare");
      onComplete?.();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Document Extraction & OCR
        </h3>
        <Button
          onClick={handleExtractAll}
          disabled={isProcessing || !workflow?.documents.length}
          className="w-full"
        >
          {isProcessing
            ? "Extracting..."
            : `Extract All Documents (${workflow?.documents.length})`}
        </Button>
      </div>

      <div className="space-y-4">
        {workflow?.documents.map((doc) => {
          const extracted = extractedDocuments.get(doc.id);

          return (
            <Card key={doc.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {extracted ? "Extraction complete" : "Pending extraction"}
                  </p>
                </div>
                {extracted && (
                  <div className="text-sm text-accent font-medium">✓ Done</div>
                )}
              </div>

              {extracted ? (
                <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        Title
                      </p>
                      <p className="text-sm font-medium">
                        {extracted.keyInformation.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        Date
                      </p>
                      <p className="text-sm font-medium">
                        {extracted.keyInformation.date || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        Organization
                      </p>
                      <p className="text-sm font-medium">
                        {extracted.keyInformation.organization || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">
                        Confidence
                      </p>
                      <p className="text-sm font-medium">
                        {extracted.confidence.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-2">
                      Identified Entities
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {extracted.entities.names.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-primary">
                            Names
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {extracted.entities.names.join(", ")}
                          </p>
                        </div>
                      )}
                      {extracted.entities.organizations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-primary">
                            Organizations
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {extracted.entities.organizations.join(", ")}
                          </p>
                        </div>
                      )}
                      {extracted.entities.locations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-primary">
                            Locations
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {extracted.entities.locations.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={() => handleExportOCR(extracted, doc.name)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 0V5m9 11l-9-2m0 0l-9 2"
                        />
                      </svg>
                      Export OCR as JSON
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleExtractDocument(doc.id)}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  Extract This Document
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {extractedDocuments.size === workflow?.documents.length &&
        workflow.documents.length > 0 && (
          <Button onClick={handleProceedToComparison} className="w-full mt-6">
            Proceed to Comparison
          </Button>
        )}
    </div>
  );
}
