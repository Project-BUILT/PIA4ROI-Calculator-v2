export function getEnv(key: string): string | undefined {
  // Vite-style env (when available)
  try {
    const im = (import.meta as any);
    const v = im?.env?.[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  } catch {}

  // Fallback for AI Studio preview (or any environment without import.meta.env)
  try {
    const w = window as any;
    const v = w?.__ENV?.[key] || w?.[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  } catch {}

  return undefined;
}