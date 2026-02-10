import type { Identity } from '@dfinity/agent';

/**
 * Safely extracts the principal string from an Internet Identity identity object
 */
export function getPrincipalString(identity: Identity | null): string | null {
  if (!identity) return null;
  
  try {
    return identity.getPrincipal().toString();
  } catch (error) {
    console.error('Failed to get principal string:', error);
    return null;
  }
}

/**
 * Truncates a principal ID for display while keeping it recognizable
 * Example: "aaaaa-bbbbb-ccccc-ddddd-eeeee" -> "aaaaa...eeeee"
 */
export function truncatePrincipal(principal: string, prefixLength = 5, suffixLength = 5): string {
  if (principal.length <= prefixLength + suffixLength + 3) {
    return principal;
  }
  
  return `${principal.slice(0, prefixLength)}...${principal.slice(-suffixLength)}`;
}
