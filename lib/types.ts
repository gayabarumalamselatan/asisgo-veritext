// Type definitions and interfaces for the Veritext system

export interface Document {
  id: string;
  name: string;
  type: 'assessment' | 'supervision' | 'followup' | 'other';
  fileSize: number;
  uploadedAt: Date;
  content: string; // Raw file content or OCR result
  metadata: {
    pages?: number;
    language?: string;
    quality?: 'high' | 'medium' | 'low';
  };
}

export interface ExtractedContent {
  id: string;
  documentId: string;
  extractedAt: Date;
  keyInformation: {
    title?: string;
    date?: string;
    organization?: string;
    subject?: string;
    [key: string]: any;
  };
  entities: {
    names: string[];
    dates: string[];
    locations: string[];
    organizations: string[];
  };
  confidence: number; // 0-100
  rawText: string;
}

export interface Comparison {
  id: string;
  document1Id: string;
  document2Id: string;
  comparedAt: Date;
  differences: DifferenceItem[];
  similarity: number; // 0-100
  summary: string;
}

export interface DifferenceItem {
  field: string;
  document1Value: string;
  document2Value: string;
  severity: 'critical' | 'major' | 'minor';
  detected: boolean; // true if potential manipulation
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'format' | 'content' | 'temporal' | 'reference';
  condition: (content: ExtractedContent) => boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface ComplianceResult {
  id: string;
  documentId: string;
  checkedAt: Date;
  ruleId: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface Insight {
  id: string;
  documentId: string;
  generatedAt: Date;
  anomalies: AnomalyItem[];
  patterns: string[];
  keyFindings: string[];
  riskFactors: string[];
  summary: string;
}

export interface AnomalyItem {
  field: string;
  value: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
}

export interface VerificationResult {
  id: string;
  documentId: string;
  verifiedAt: Date;
  status: 'approved' | 'rejected' | 'pending' | 'flagged';
  decision: string;
  verifiedBy: string;
  notes: string;
}

export interface AuditTrail {
  id: string;
  action: string;
  documentId: string;
  timestamp: Date;
  userId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  details: string;
}

export interface VerificationWorkflow {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  currentStep: 'upload' | 'extract' | 'compare' | 'compliance' | 'insights' | 'review' | 'complete';
  documents: Document[];
  extracted: ExtractedContent[];
  comparisons: Comparison[];
  compliance: ComplianceResult[];
  insights: Insight[];
  verification: VerificationResult;
  auditTrail: AuditTrail[];
}
