/**
 * Pure formatting utilities for React Impact Score (RIS).
 * Kept separate from client hooks so Server Components do not pull in SWR.
 */

/**
 * Format RIS score as percentage
 */
export function formatRIS(ris: number): string {
  return `${(ris * 100).toFixed(1)}%`;
}

/**
 * Format allocation as currency
 */
export function formatAllocation(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usd);
}

/**
 * Get color class for RIS score (Tailwind CSS)
 */
export function getRISColorClass(ris: number): string {
  if (ris >= 0.8) return 'text-green-400';
  if (ris >= 0.6) return 'text-cyan-400';
  if (ris >= 0.4) return 'text-yellow-400';
  if (ris >= 0.2) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get badge color class for component score
 */
export function getComponentColorClass(component: string): string {
  const colors: Record<string, string> = {
    EF: 'bg-primary/20 text-blue-300',
    CQ: 'bg-success/20 text-green-300',
    MH: 'bg-accent/20 text-purple-300',
    CB: 'bg-warning/20 text-yellow-300',
    MA: 'bg-accent/20 text-pink-300',
  };
  return colors[component] || 'bg-muted/20 text-muted-foreground';
}
