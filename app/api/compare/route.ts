import { Comparison, DifferenceItem, ExtractedContent } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { content1, content2, extracted1, extracted2 } = await request.json();

    if (!content1 || !content2 || !extracted1 || !extracted2) {
      return Response.json({ error: 'Missing comparison data' }, { status: 400 });
    }

    const comparison = mockCompareDocuments(content1, content2, extracted1, extracted2);
    return Response.json({ success: true, data: comparison });
  } catch (error) {
    return Response.json({ error: 'Comparison failed' }, { status: 500 });
  }
}

function mockCompareDocuments(
  content1: string,
  content2: string,
  extracted1: ExtractedContent,
  extracted2: ExtractedContent
): Omit<Comparison, 'id' | 'document1Id' | 'document2Id'> {
  const differences: DifferenceItem[] = [];

  // Compare key information fields
  const keys1 = Object.keys(extracted1.keyInformation);
  const keys2 = Object.keys(extracted2.keyInformation);
  const allKeys = Array.from(new Set([...keys1, ...keys2]));

  for (const key of allKeys) {
    const val1 = String(extracted1.keyInformation[key] || '');
    const val2 = String(extracted2.keyInformation[key] || '');

    if (val1 !== val2) {
      const severity = getSeverity(key);
      const detected = detectPotentialManipulation(val1, val2);

      differences.push({
        field: key,
        document1Value: val1,
        document2Value: val2,
        severity,
        detected,
      });
    }
  }

  // Compare entities
  const namesDiff = getEntityDifferences(extracted1.entities.names, extracted2.entities.names);
  if (namesDiff > 0) {
    differences.push({
      field: 'names',
      document1Value: extracted1.entities.names.join(', '),
      document2Value: extracted2.entities.names.join(', '),
      severity: 'major',
      detected: true,
    });
  }

  // Calculate similarity score
  const similarity = Math.max(0, 100 - differences.length * 15);

  // Generate summary
  const criticalCount = differences.filter((d) => d.severity === 'critical').length;
  const majorCount = differences.filter((d) => d.severity === 'major').length;
  const minorCount = differences.filter((d) => d.severity === 'minor').length;

  let summary = `Found ${differences.length} differences: `;
  if (criticalCount > 0) summary += `${criticalCount} critical, `;
  if (majorCount > 0) summary += `${majorCount} major, `;
  if (minorCount > 0) summary += `${minorCount} minor`;
  if (similarity > 80) summary += ' - Documents are mostly similar';

  return {
    comparedAt: new Date(),
    differences,
    similarity,
    summary,
  };
}

function getSeverity(field: string): 'critical' | 'major' | 'minor' {
  const criticalFields = ['date', 'organization', 'amount', 'status'];
  const majorFields = ['title', 'subject', 'organization'];

  if (criticalFields.includes(field.toLowerCase())) return 'critical';
  if (majorFields.includes(field.toLowerCase())) return 'major';
  return 'minor';
}

function detectPotentialManipulation(val1: string, val2: string): boolean {
  // Detect suspicious changes
  const val1Lower = val1.toLowerCase();
  const val2Lower = val2.toLowerCase();

  // Check for character substitution (0->O, l->1, etc)
  const suspiciousPattern = /[0O1l]/g;
  if (val1.replace(suspiciousPattern, '') === val2.replace(suspiciousPattern, '')) {
    return true;
  }

  // Check for significant text changes
  const similarity = stringSimilarity(val1Lower, val2Lower);
  return similarity < 0.7 && val1.length > 3;
}

function getEntityDifferences(entities1: string[], entities2: string[]): number {
  const set1 = new Set(entities1.map((e) => e.toLowerCase()));
  const set2 = new Set(entities2.map((e) => e.toLowerCase()));

  const differences = new Set([...set1, ...set2]);
  const intersection = new Set([...set1].filter((e) => set2.has(e)));

  return differences.size - intersection.size;
}

function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
