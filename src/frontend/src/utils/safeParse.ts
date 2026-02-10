/**
 * Safely parses a string to BigInt without throwing
 * Returns null if parsing fails
 */
export function safeParseBigInt(value: string | undefined | null): bigint | null {
  if (!value) return null;
  
  try {
    return BigInt(value);
  } catch (error) {
    console.error('Failed to parse BigInt:', error);
    return null;
  }
}

/**
 * Safely parses a string to a positive integer
 * Returns null if parsing fails or value is not positive
 */
export function safeParsePositiveInt(value: string | undefined | null): number | null {
  if (!value) return null;
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }
  
  return parsed;
}

/**
 * Validates that a quantity is a positive integer
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}
