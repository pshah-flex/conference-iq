/**
 * Utility functions for handling URLs and redirects
 */

/**
 * Get the base URL for the current environment
 * Returns the production URL in production, localhost in development
 */
export function getBaseUrl(): string {
  // In production, use the Vercel URL or custom domain
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // In Vercel, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // In browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for server-side rendering
  return process.env.NODE_ENV === 'production'
    ? 'https://conference-iq.vercel.app' // Update this to your actual production URL
    : 'http://localhost:3000';
}

/**
 * Get the correct redirect URL for auth flows
 */
export function getAuthRedirectUrl(path: string = '/auth/verify-email'): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

