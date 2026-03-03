'use client';

import { useVerification } from '@/lib/verification-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { exportToXLSX } from '@/lib/export-utils';

interface AuditTrailProps {
  onNewWorkflow?: () => void;
}

export function AuditTrailAndExport({ onNewWorkflow }: AuditTrailProps) {
  const { workflow, exportData, clearWorkflow } = useVerification();

  const handleExportXLSX = () => {
    if (workflow) {
      exportToXLSX(workflow);
    }
  };

  const handleExportPDF = () => {
    // Generate PDF-friendly text report
    const lines = [
      '='.repeat(80),
      'VERITEXT - DOCUMENT VERIFICATION & INTELLIGENCE PLATFORM',
      'VERIFICATION REPORT',
      '='.repeat(80),
      '',
      `Report Generated: ${new Date().toLocaleString()}`,
      `Workflow ID: ${workflow?.id}`,
      '',
      '--- DOCUMENTS ---',
    ];

    workflow?.documents.forEach((doc) => {
      lines.push(`Document: ${doc.name}`);
      lines.push(`  Upload Date: ${doc.uploadedAt.toLocaleString()}`);
      lines.push(`  File Size: ${(doc.fileSize / 1024).toFixed(2)} KB`);
      lines.push(`  Type: ${doc.type}`);
      lines.push('');
    });

    if (workflow?.extracted.length) {
      lines.push('--- EXTRACTED INFORMATION ---');
      workflow.extracted.forEach((ext) => {
        const doc = workflow.documents.find((d) => d.id === ext.documentId);
        lines.push(`Document: ${doc?.name}`);
        lines.push(`  Confidence: ${ext.confidence.toFixed(1)}%`);
        lines.push(`  Title: ${ext.keyInformation.title || 'N/A'}`);
        lines.push(`  Date: ${ext.keyInformation.date || 'N/A'}`);
        lines.push(`  Organization: ${ext.keyInformation.organization || 'N/A'}`);
        lines.push(`  Entities Found:`);
        lines.push(`    Names: ${ext.entities.names.join(', ') || 'None'}`);
        lines.push(`    Organizations: ${ext.entities.organizations.join(', ') || 'None'}`);
        lines.push(`    Locations: ${ext.entities.locations.join(', ') || 'None'}`);
        lines.push('');
      });
    }

    if (workflow?.compliance.length) {
      lines.push('--- COMPLIANCE CHECK RESULTS ---');
      const docGroups = new Map<string, any[]>();
      workflow.compliance.forEach((c) => {
        if (!docGroups.has(c.documentId)) {
          docGroups.set(c.documentId, []);
        }
        docGroups.get(c.documentId)!.push(c);
      });

      docGroups.forEach((results, docId) => {
        const doc = workflow.documents.find((d) => d.id === docId);
        lines.push(`Document: ${doc?.name}`);
        const passed = results.filter((r) => r.passed).length;
        lines.push(`  Results: ${passed}/${results.length} passed`);
        results.forEach((r) => {
          lines.push(`  [${r.severity.toUpperCase()}] ${r.message}`);
        });
        lines.push('');
      });
    }

    if (workflow?.verification) {
      lines.push('--- VERIFICATION DECISION ---');
      lines.push(`Status: ${workflow.verification.status}`);
      lines.push(`Decision: ${workflow.verification.decision}`);
      lines.push(`Verified By: ${workflow.verification.verifiedBy}`);
      if (workflow.verification.notes) {
        lines.push(`Notes: ${workflow.verification.notes}`);
      }
      lines.push('');
    }

    lines.push('--- AUDIT TRAIL ---');
    workflow?.auditTrail.forEach((audit) => {
      lines.push(`[${audit.timestamp.toLocaleString()}] ${audit.action}`);
      lines.push(`  User: ${audit.userId}`);
      lines.push(`  Details: ${audit.details}`);
    });

    lines.push('');
    lines.push('='.repeat(80));
    lines.push('END OF REPORT');
    lines.push('='.repeat(80));

    const text = lines.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', `veritext-report-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewWorkflow = () => {
    clearWorkflow();
    onNewWorkflow?.();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-6">Audit Trail & Report Export</h3>

      {/* Verification Complete */}
      <Card className="p-8 text-center mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-xl font-bold text-green-700 dark:text-green-200 mb-2">Verification Complete</h4>
        <p className="text-green-600 dark:text-green-300">
          All documents have been processed and verified. You can now export the report or start a new verification.
        </p>
      </Card>

      {/* Summary */}
      <Card className="p-6 mb-6">
        <h4 className="font-semibold mb-4">Verification Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Documents Processed</p>
            <p className="text-2xl font-bold">{workflow?.documents.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data Extracted</p>
            <p className="text-2xl font-bold">{workflow?.extracted.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Comparisons</p>
            <p className="text-2xl font-bold">{workflow?.comparisons.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Audit Entries</p>
            <p className="text-2xl font-bold">{workflow?.auditTrail.length}</p>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6 mb-6">
        <h4 className="font-semibold mb-4">Export Report</h4>
        <div className="space-y-3">
          <Button
            onClick={handleExportXLSX}
            variant="outline"
            className="w-full justify-start"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export as XLSX (Excel - Structured Results)
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="w-full justify-start"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export as JSON (Machine Readable)
          </Button>
        </div>
      </Card>

      {/* Audit Trail */}
      {workflow?.auditTrail.length! > 0 && (
        <Card className="p-6 mb-6">
          <h4 className="font-semibold mb-4">Audit Trail</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {workflow?.auditTrail.map((audit, idx) => (
              <div key={audit.id} className="flex gap-4 text-sm pb-3 border-b border-border last:border-b-0">
                <div className="text-xs text-muted-foreground font-mono min-w-fit">
                  {audit.timestamp.toLocaleTimeString()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{audit.action}</p>
                  <p className="text-xs text-muted-foreground">{audit.details}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleNewWorkflow}
          className="flex-1"
        >
          Start New Verification
        </Button>
      </div>
    </div>
  );
}
