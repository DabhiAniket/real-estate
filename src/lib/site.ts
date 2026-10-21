// Canonical site origin. Set NEXT_PUBLIC_SITE_URL in the deployment
// environment (e.g. Vercel project settings) to the real production domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://realestate-atelier.com").replace(/\/$/, "");
export const SITE_NAME = "Real Estate Atelier";
