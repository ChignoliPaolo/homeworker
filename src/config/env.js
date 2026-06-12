/**
 * Centralized runtime configuration.
 *
 * Values are read from `EXPO_PUBLIC_*` environment variables (inlined by Expo
 * at build time) and fall back to safe defaults so the project runs
 * out-of-the-box in mock mode with zero setup.
 */

const toBool = (value, fallback = false) =>
  value == null ? fallback : ['1', 'true', 'yes'].includes(String(value).toLowerCase());

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const ENV = {
  /** URL of YOUR backend proxy that talks to OpenAI / Gemini. */
  VISION_API_URL:
    process.env.EXPO_PUBLIC_VISION_API_URL ?? 'https://your-backend.example.com/api/solve',

  /** Optional session/user token for your backend (NOT a provider key). */
  VISION_API_KEY: process.env.EXPO_PUBLIC_VISION_API_KEY ?? '',

  /** Model identifier forwarded to the backend. */
  VISION_MODEL: process.env.EXPO_PUBLIC_VISION_MODEL ?? 'gpt-4o',

  /** Abort the request after this many milliseconds. */
  REQUEST_TIMEOUT_MS: toNumber(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS, 45000),

  /** When true, the app returns a built-in sample solution (no network call). */
  USE_MOCK: toBool(process.env.EXPO_PUBLIC_USE_MOCK, true),
};
