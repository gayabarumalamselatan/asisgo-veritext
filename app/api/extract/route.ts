import { ExtractedContent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    let content: string;

    if (fileType === "csv") {
      // Parse CSV
      const text = await file.text();
      content = parseCSV(text);
    } else if (fileType === "xlsx") {
      // Parse XLSX
      const arrayBuffer = await file.arrayBuffer();
      content = await parseXLSX(arrayBuffer);
    } else {
      // Parse text/PDF
      content = await file.text();
    }

    // Mock OCR and extraction using pattern matching
    const extractedContent = mockExtractDocument(content);

    return Response.json({ success: true, data: extractedContent });
  } catch (error) {
    console.error("[v0] Extraction API error:", error);
    return Response.json(
      {
        error: "Extraction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function parseCSV(csv: string): string {
  // Convert CSV to readable text format
  const lines = csv.split("\n");
  const headers = lines[0]?.split(",").map((h) => h.trim()) || [];

  let text = `CSV Document - ${headers.length} columns, ${lines.length - 1} rows\n`;
  text += `Headers: ${headers.join(", ")}\n\n`;
  text += "Data:\n";

  // Add first 10 rows
  for (let i = 1; i < Math.min(11, lines.length); i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    text += `Row ${i}: ${values.join(" | ")}\n`;
  }

  return text;
}

async function parseXLSX(arrayBuffer: ArrayBuffer): Promise<string> {
  // Dynamic import for xlsx library
  const XLSX = await import("xlsx");

  // Convert ArrayBuffer to Buffer-like format for xlsx
  const uint8Array = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(uint8Array, { type: "array" });

  if (!workbook.SheetNames.length) {
    throw new Error("No sheets found in XLSX file");
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error("Could not read worksheet");
  }

  // Get CSV representation
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return parseCSV(csv);
}

function mockExtractDocument(
  content: string,
): Omit<ExtractedContent, "id" | "documentId"> {
  // Extract key information using simple patterns
  const keyInformation: Record<string, any> = {};

  // Extract title (usually first substantial line)
  const titleMatch = content
    .split("\n")
    .find((line) => line.trim().length > 10);
  if (titleMatch) keyInformation.title = titleMatch.trim();

  // Extract dates
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const dates = content.match(dateRegex) || [];
  if (dates.length) keyInformation.date = dates[0];

  // Extract organization names (mock: look for CAPITALS)
  const orgMatch = content.match(/[A-Z]{2,}/g);
  keyInformation.organization = orgMatch ? orgMatch[0] : "N/A";

  // Extract subject
  const subjectMatch = content.match(/subject:?\s*([^\n]+)/i);
  keyInformation.subject = subjectMatch ? subjectMatch[1].trim() : "General";

  // Extract entities
  const entities = {
    names: extractNames(content),
    dates: dates,
    locations: extractLocations(content),
    organizations: [keyInformation.organization],
  };

  return {
    extractedAt: new Date(),
    keyInformation,
    entities,
    confidence: 85 + Math.random() * 15, // 85-100
    rawText: content.substring(0, 500), // First 500 chars
  };
}

function extractNames(content: string): string[] {
  const namePatterns = [
    /(?:Mr\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
    /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g,
  ];

  const names = new Set<string>();
  for (const pattern of namePatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      names.add(match[0]);
      if (names.size >= 5) break;
    }
  }

  return Array.from(names).slice(0, 5);
}

function extractLocations(content: string): string[] {
  const locations = new Set<string>();
  const locationKeywords = ["at", "in", "from", "to"];

  // Simple pattern: look for capitalized words after location keywords
  const words = content.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    if (locationKeywords.includes(words[i].toLowerCase())) {
      const potentialLocation = words[i + 1];
      if (/^[A-Z]/.test(potentialLocation) && potentialLocation.length > 2) {
        locations.add(potentialLocation.replace(/[,.:;]/g, ""));
      }
    }
  }

  return Array.from(locations).slice(0, 5);
}
