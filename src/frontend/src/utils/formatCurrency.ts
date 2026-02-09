/**
 * Format a price value (bigint) as Indian Rupees (INR)
 * Uses en-IN locale for proper grouping (e.g., ₹79,999)
 */
export function formatINR(price: bigint): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  
  return formatter.format(Number(price));
}
