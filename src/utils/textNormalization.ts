/**
 * Normalizes text for comparison by:
 * 1. Converting to lowercase
 * 2. Removing accents
 * 3. Removing special characters
 * 4. Removing duplicate spaces
 * 5. Removing irrelevant words (optional)
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters (don't replace with space)
    .replace(/\s+/g, ' ') // Remove duplicate spaces
    .trim();
}

const IRRELEVANT_WORDS = ['de', 'para', 'com', 'erro', 'problema', 'ajuda', 'urgente'];

export function removeIrrelevantWords(text: string): string {
  if (!text) return '';
  
  const normalized = normalizeText(text);
  return normalized
    .split(' ')
    .filter(word => !IRRELEVANT_WORDS.includes(word))
    .join(' ');
}
