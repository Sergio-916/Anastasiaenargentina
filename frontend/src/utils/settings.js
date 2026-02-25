export const SHOW_GROUP_TOURS = true;

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

/**
 * Returns the backend URL based on execution context.
 * - Server-side: uses ENVIRONMENT and BACKEND_URL
 * - Client-side: uses NEXT_PUBLIC_BACKEND_URL (required for client components)
 */
export function getBackendUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  }
  return process.env.ENVIRONMENT === "production"
    ? process.env.BACKEND_URL
    : DEFAULT_BACKEND_URL;
}