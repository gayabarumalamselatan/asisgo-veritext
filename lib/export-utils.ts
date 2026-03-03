import * as XLSX from 'xlsx';
import { VerificationWorkflow } from './types';

export function exportToXLSX(workflow: VerificationWorkflow) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ['VERITEXT - VERIFICATION REPORT'],
    ['Generated:', new Date().toLocaleString()],
    ['Workflow ID:', workflow.id],
    [],
    ['Summary Statistics'],
    ['Documents Processed:', workflow.documents.length],
    ['Data Extracted:', workflow.extracted.length],
    ['Comparisons:', workflow.comparisons.length],
    ['Compliance Checks Passed:', workflow.compliance.filter(c => c.passed).length],
    ['Total Compliance Checks:', workflow.compliance.length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Results Matrix (Documents as rows, Results as columns)
  const resultsHeader = [
    'Document Name',
    'File Type',
    'Extraction Confidence',
    'Title',
    'Date',
    'Organization',
    'Extracted Entities',
    'Comparisons',
    'Compliance Pass Rate',
    'Compliance Status',
    'Insights Risk Level',
    'Decision',
    'Verification Status',
  ];

  const resultsData: any[][] = [resultsHeader];

  workflow.documents.forEach((doc) => {
    const extracted = workflow.extracted.find(e => e.documentId === doc.id);
    const comparisonCount = workflow.comparisons.filter(c => c.primaryDocId === doc.id || c.secondaryDocId === doc.id).length;
    const complianceResults = workflow.compliance.filter(c => c.documentId === doc.id);
    const compliancePassed = complianceResults.filter(c => c.passed).length;
    const compliancePassRate = complianceResults.length > 0 ? `${Math.round((compliancePassed / complianceResults.length) * 100)}%` : 'N/A';
    const insights = workflow.insights.filter(i => i.documentId === doc.id);
    const riskLevel = insights.length > 0 ? insights[0].riskLevel : 'N/A';

    resultsData.push([
      doc.name,
      doc.type.split('/')[1] || doc.type,
      extracted?.confidence.toFixed(1) + '%' || 'N/A',
      extracted?.keyInformation.title || 'N/A',
      extracted?.keyInformation.date || 'N/A',
      extracted?.keyInformation.organization || 'N/A',
      `Names: ${extracted?.entities.names.length || 0}, Organizations: ${extracted?.entities.organizations.length || 0}, Locations: ${extracted?.entities.locations.length || 0}`,
      comparisonCount,
      compliancePassRate,
      compliancePassed === complianceResults.length ? 'PASS' : `${compliancePassed}/${complianceResults.length}`,
      riskLevel,
      workflow.verification?.decision || 'Pending',
      workflow.verification?.status || 'Not Reviewed',
    ]);
  });

  const resultsSheet = XLSX.utils.aoa_to_sheet(resultsData);
  // Set column widths
  resultsSheet['!cols'] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, resultsSheet, 'Results Matrix');

  // Sheet 3: Detailed Extraction
  if (workflow.extracted.length > 0) {
    const extractionHeader = [
      'Document',
      'Title',
      'Date',
      'Organization',
      'Subject',
      'Confidence',
      'Names Detected',
      'Organizations Detected',
      'Locations Detected',
      'Text Preview',
    ];

    const extractionData: any[][] = [extractionHeader];
    workflow.extracted.forEach((ext) => {
      const doc = workflow.documents.find(d => d.id === ext.documentId);
      extractionData.push([
        doc?.name || 'Unknown',
        ext.keyInformation.title || 'N/A',
        ext.keyInformation.date || 'N/A',
        ext.keyInformation.organization || 'N/A',
        ext.keyInformation.subject || 'N/A',
        ext.confidence.toFixed(1) + '%',
        ext.entities.names.join('; ') || 'None',
        ext.entities.organizations.join('; ') || 'None',
        ext.entities.locations.join('; ') || 'None',
        ext.rawText.substring(0, 100),
      ]);
    });

    const extractionSheet = XLSX.utils.aoa_to_sheet(extractionData);
    extractionSheet['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 50 },
    ];
    XLSX.utils.book_append_sheet(wb, extractionSheet, 'Extraction Details');
  }

  // Sheet 4: Compliance Details
  if (workflow.compliance.length > 0) {
    const complianceHeader = [
      'Document',
      'Rule ID',
      'Rule Name',
      'Description',
      'Status',
      'Severity',
      'Message',
    ];

    const complianceData: any[][] = [complianceHeader];
    workflow.compliance.forEach((comp) => {
      const doc = workflow.documents.find(d => d.id === comp.documentId);
      complianceData.push([
        doc?.name || 'Unknown',
        comp.ruleId,
        comp.ruleName,
        comp.ruleDescription,
        comp.passed ? 'PASS' : 'FAIL',
        comp.severity.toUpperCase(),
        comp.message,
      ]);
    });

    const complianceSheet = XLSX.utils.aoa_to_sheet(complianceData);
    complianceSheet['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 10 },
      { wch: 12 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, complianceSheet, 'Compliance Details');
  }

  // Sheet 5: Audit Trail
  if (workflow.auditTrail.length > 0) {
    const auditHeader = ['Timestamp', 'Action', 'User ID', 'Details'];
    const auditData: any[][] = [auditHeader];

    workflow.auditTrail.forEach((audit) => {
      auditData.push([
        audit.timestamp.toLocaleString(),
        audit.action,
        audit.userId,
        audit.details,
      ]);
    });

    const auditSheet = XLSX.utils.aoa_to_sheet(auditData);
    auditSheet['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
      { wch: 50 },
    ];
    XLSX.utils.book_append_sheet(wb, auditSheet, 'Audit Trail');
  }

  // Generate file
  XLSX.writeFile(wb, `veritext-report-${Date.now()}.xlsx`);
}
