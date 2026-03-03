import { Insight, ExtractedContent, AnomalyItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { extracted, documentId } = await request.json();

    if (!extracted || !documentId) {
      return Response.json({ error: 'Missing insight analysis data' }, { status: 400 });
    }

    const insights = mockGenerateInsights(extracted, documentId);
    return Response.json({ success: true, data: insights });
  } catch (error) {
    return Response.json({ error: 'Insight generation failed' }, { status: 500 });
  }
}

function mockGenerateInsights(extracted: ExtractedContent, documentId: string): Omit<Insight, 'id' | 'documentId'> {
  const anomalies = detectAnomalies(extracted);
  const patterns = identifyPatterns(extracted);
  const keyFindings = extractKeyFindings(extracted);
  const riskFactors = assessRiskFactors(extracted, anomalies);

  let summary = `Analysis identified ${anomalies.length} anomalies. `;
  summary += `Document shows ${patterns.length} distinct patterns. `;
  summary += `Risk level: ${assessOverallRisk(anomalies, riskFactors)}.`;

  return {
    generatedAt: new Date(),
    anomalies,
    patterns,
    keyFindings,
    riskFactors,
    summary,
  };
}

function detectAnomalies(extracted: ExtractedContent): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  // Check extraction confidence
  if (extracted.confidence < 75) {
    anomalies.push({
      field: 'extraction_confidence',
      value: `${extracted.confidence.toFixed(1)}%`,
      riskLevel: 'high',
      description: 'Low extraction confidence may indicate OCR issues or poor document quality.',
    });
  }

  // Check for missing key information
  const missingFields = [];
  if (!extracted.keyInformation.date) missingFields.push('date');
  if (!extracted.keyInformation.organization) missingFields.push('organization');
  if (!extracted.keyInformation.title) missingFields.push('title');

  if (missingFields.length > 0) {
    anomalies.push({
      field: 'missing_information',
      value: missingFields.join(', '),
      riskLevel: 'medium',
      description: `Document is missing critical information: ${missingFields.join(', ')}`,
    });
  }

  // Check entity extraction
  if (extracted.entities.names.length === 0 && extracted.entities.organizations.length === 0) {
    anomalies.push({
      field: 'entity_extraction',
      value: 'No entities found',
      riskLevel: 'medium',
      description: 'Document contains no identifiable persons or organizations.',
    });
  }

  // Check for suspicious patterns in text
  const suspiciousPatterns = detectSuspiciousPatterns(extracted.rawText);
  if (suspiciousPatterns.length > 0) {
    anomalies.push({
      field: 'text_patterns',
      value: suspiciousPatterns.join(', '),
      riskLevel: 'high',
      description: `Detected suspicious text patterns that may indicate tampering: ${suspiciousPatterns.join(', ')}`,
    });
  }

  return anomalies;
}

function identifyPatterns(extracted: ExtractedContent): string[] {
  const patterns: string[] = [];

  // Language/structure patterns
  if (extracted.keyInformation.title) {
    patterns.push('Clear document title present');
  }

  if (extracted.entities.dates.length > 1) {
    patterns.push('Multiple temporal references');
  }

  if (extracted.entities.organizations.length > 0) {
    patterns.push('Organizational context identified');
  }

  if (extracted.entities.locations.length > 2) {
    patterns.push('Geographic distribution across locations');
  }

  if (extracted.entities.names.length > 3) {
    patterns.push('Multiple person references');
  }

  // Content patterns
  if (extracted.rawText.toLowerCase().includes('assessment')) {
    patterns.push('Assessment/evaluation language detected');
  }

  if (extracted.rawText.toLowerCase().includes('supervision') || extracted.rawText.toLowerCase().includes('supervisor')) {
    patterns.push('Supervision content pattern');
  }

  if (extracted.rawText.toLowerCase().includes('follow') || extracted.rawText.toLowerCase().includes('action')) {
    patterns.push('Follow-up action items identified');
  }

  return patterns.slice(0, 5);
}

function extractKeyFindings(extracted: ExtractedContent): string[] {
  const findings: string[] = [];

  // Subject finding
  if (extracted.keyInformation.subject) {
    findings.push(`Primary subject: ${extracted.keyInformation.subject}`);
  }

  // Organization finding
  if (extracted.keyInformation.organization && extracted.keyInformation.organization !== 'N/A') {
    findings.push(`Organization context: ${extracted.keyInformation.organization}`);
  }

  // Temporal finding
  if (extracted.keyInformation.date) {
    findings.push(`Document date: ${extracted.keyInformation.date}`);
  }

  // Entity finding
  if (extracted.entities.names.length > 0) {
    findings.push(`${extracted.entities.names.length} person(s) identified: ${extracted.entities.names.slice(0, 2).join(', ')}${extracted.entities.names.length > 2 ? ', ...' : ''}`);
  }

  // Geographic finding
  if (extracted.entities.locations.length > 0) {
    findings.push(`Location references: ${extracted.entities.locations.slice(0, 2).join(', ')}`);
  }

  return findings;
}

function assessRiskFactors(extracted: ExtractedContent, anomalies: AnomalyItem[]): string[] {
  const riskFactors: string[] = [];

  // High-risk factors
  const highRiskAnomalies = anomalies.filter((a) => a.riskLevel === 'high');
  if (highRiskAnomalies.length > 0) {
    riskFactors.push(`High-risk anomalies detected (${highRiskAnomalies.length})`);
  }

  // Extraction quality
  if (extracted.confidence < 80) {
    riskFactors.push('Low extraction confidence - manual verification needed');
  }

  // Missing critical information
  const hasMissingCritical =
    !extracted.keyInformation.date || !extracted.keyInformation.organization;
  if (hasMissingCritical) {
    riskFactors.push('Missing critical information fields');
  }

  // Unusual structure
  if (extracted.entities.names.length > 10) {
    riskFactors.push('Unusually high number of name references');
  }

  return riskFactors;
}

function detectSuspiciousPatterns(text: string): string[] {
  const suspicious: string[] = [];

  // Check for character substitution patterns
  if (/[0O1l]{2,}/.test(text)) {
    suspicious.push('Repeated similar-looking characters');
  }

  // Check for abnormal spacing
  if (/\s{3,}/.test(text)) {
    suspicious.push('Irregular spacing detected');
  }

  // Check for mixed fonts/styles (indicators)
  if (/[^a-zA-Z0-9\s]/.test(text) && text.match(/[^a-zA-Z0-9\s]/g)!.length > text.length * 0.3) {
    suspicious.push('Unusual character distribution');
  }

  return suspicious;
}

function assessOverallRisk(anomalies: AnomalyItem[], riskFactors: string[]): string {
  const highRiskCount = anomalies.filter((a) => a.riskLevel === 'high').length;
  const mediumRiskCount = anomalies.filter((a) => a.riskLevel === 'medium').length;

  if (highRiskCount >= 2 || riskFactors.length >= 3) {
    return 'HIGH';
  } else if (highRiskCount === 1 || mediumRiskCount >= 2) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}
