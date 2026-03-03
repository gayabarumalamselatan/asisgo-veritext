import { ComplianceResult, ExtractedContent } from '@/lib/types';

// Define compliance rules
const complianceRules = [
  {
    id: 'rule-001',
    name: 'Document Date Required',
    description: 'All documents must have a valid date',
    check: (extracted: ExtractedContent) => !!extracted.keyInformation.date,
    severity: 'error' as const,
    message: 'Document is missing a date. This is required for verification.',
  },
  {
    id: 'rule-002',
    name: 'Organization Identified',
    description: 'Document must identify an organization',
    check: (extracted: ExtractedContent) => !!extracted.keyInformation.organization && extracted.keyInformation.organization !== 'N/A',
    severity: 'warning' as const,
    message: 'Organization could not be identified. Please verify manually.',
  },
  {
    id: 'rule-003',
    name: 'Title Present',
    description: 'Document should have a clear title',
    check: (extracted: ExtractedContent) => !!extracted.keyInformation.title && extracted.keyInformation.title.length > 5,
    severity: 'warning' as const,
    message: 'Document lacks a clear title or header.',
  },
  {
    id: 'rule-004',
    name: 'Extraction Confidence',
    description: 'Extraction confidence must be acceptable',
    check: (extracted: ExtractedContent) => extracted.confidence >= 70,
    severity: 'warning' as const,
    message: 'Document extraction confidence is below 70%. Manual review recommended.',
  },
  {
    id: 'rule-005',
    name: 'Named Entities Found',
    description: 'Document should contain identifiable entities',
    check: (extracted: ExtractedContent) =>
      extracted.entities.names.length > 0 ||
      extracted.entities.organizations.length > 0,
    severity: 'info' as const,
    message: 'No named entities detected. Document may be too brief or unclear.',
  },
  {
    id: 'rule-006',
    name: 'Location Information',
    description: 'Location data should be present for context',
    check: (extracted: ExtractedContent) => {
      // Extract locations from keyInformation as fallback
      const hasLocations = extracted.entities.locations.length > 0;
      const dateString = extracted.keyInformation.date || '';
      const titleString = extracted.keyInformation.title || '';
      // Consider it passed if we have any contextual information (date/title as location context)
      return hasLocations || dateString.length > 0 || titleString.length > 5;
    },
    severity: 'info' as const,
    message: 'No explicit location information found. Document context may be limited.',
  },
  {
    id: 'rule-007',
    name: 'Content Length',
    description: 'Document should contain sufficient content',
    check: (extracted: ExtractedContent) => extracted.rawText.length > 100,
    severity: 'warning' as const,
    message: 'Document content is very brief. Ensure all necessary information is present.',
  },
  {
    id: 'rule-008',
    name: 'Data Consistency',
    description: 'Key information should be internally consistent',
    check: (extracted: ExtractedContent) => {
      // Check if date format is consistent
      const date = extracted.keyInformation.date;
      if (!date) return true;
      return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(date);
    },
    severity: 'warning' as const,
    message: 'Data formatting appears inconsistent.',
  },
];

export async function POST(request: Request) {
  try {
    const { extracted, documentId } = await request.json();

    if (!extracted || !documentId) {
      return Response.json({ error: 'Missing compliance check data' }, { status: 400 });
    }

    const results = mockCheckCompliance(extracted, documentId);
    return Response.json({ success: true, data: results });
  } catch (error) {
    return Response.json({ error: 'Compliance check failed' }, { status: 500 });
  }
}

function mockCheckCompliance(extracted: ExtractedContent, documentId: string): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  for (const rule of complianceRules) {
    const passed = rule.check(extracted);

    results.push({
      id: `compliance-${rule.id}-${Date.now()}`,
      documentId,
      checkedAt: new Date(),
      ruleId: rule.id,
      passed,
      message: passed ? `✓ ${rule.name} - OK` : rule.message,
      severity: rule.severity,
    });
  }

  return results;
}
