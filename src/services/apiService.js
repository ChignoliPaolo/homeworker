import { ENV } from '../config/env';

/**
 * apiService
 * ----------
 * Modular service that sends a captured homework image to a multimodal Vision
 * LLM (e.g. OpenAI GPT-4o or Google Gemini) and returns a Markdown-formatted
 * solution.
 *
 * ┌──────────── SECURITY ────────────────────────────────────────────────┐
 * │ Never embed a provider API key (OpenAI/Gemini) inside a shipped mobile │
 * │ app — it can be trivially extracted from the bundle. Use a backend     │
 * │ proxy that keeps the secret server-side:                               │
 * │                                                                        │
 * │     App  ──image──▶  Your backend proxy  ──key──▶  OpenAI / Gemini     │
 * │                                                                        │
 * │ `ENV.VISION_API_URL` should point at *your* backend. The provider      │
 * │ payload builders below are exported so you can reuse them there.       │
 * └────────────────────────────────────────────────────────────────────────┘
 */

const DEFAULT_PROMPT = [
  'You are an expert tutor. Solve the homework, exercise, or test question(s)',
  'shown in the image. Work in ANY subject (math, physics, chemistry, biology,',
  'history, languages, programming, etc.).',
  '',
  'Respond in clean GitHub-flavored Markdown:',
  '- Begin with a short **Answer** section containing the final result.',
  '- Follow with a **Step-by-step** section explaining the reasoning.',
  '- Use LaTeX for math: inline as $...$ and display as $$...$$.',
  '- Keep it concise and student-friendly.',
  'If the image is unreadable, say so and ask for a clearer photo.',
].join('\n');

/** Error type that carries an HTTP status and underlying cause. */
export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

/** Build an OpenAI Chat Completions (GPT-4o) multimodal payload. */
export function buildOpenAIPayload({ base64, mimeType = 'image/jpeg', prompt = DEFAULT_PROMPT, model }) {
  return {
    model: model ?? ENV.VISION_MODEL,
    max_tokens: 1200,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        ],
      },
    ],
  };
}

/** Build a Google Gemini `generateContent` multimodal payload. */
export function buildGeminiPayload({ base64, mimeType = 'image/jpeg', prompt = DEFAULT_PROMPT }) {
  return {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }],
      },
    ],
  };
}

/** Normalize the many possible provider response shapes into a markdown string. */
function extractSolution(json) {
  // Recommended: your backend returns { solution: "..." }
  if (json?.solution) return json.solution;
  // OpenAI Chat Completions shape
  if (json?.choices?.[0]?.message?.content) return json.choices[0].message.content;
  // Gemini generateContent shape
  if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return json.candidates[0].content.parts[0].text;
  }
  return null;
}

async function safeText(response) {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}

/**
 * Send a captured image to the Vision API and return the solution.
 *
 * @param {object}  image
 * @param {string}  image.base64     Base64-encoded image data (no data: prefix).
 * @param {string} [image.uri]       Local file URI (kept for previewing).
 * @param {string} [image.mimeType]  Defaults to "image/jpeg".
 * @param {string} [image.prompt]    Override the default tutor prompt.
 * @returns {Promise<{ solution: string, raw?: any }>}
 */
export async function solveHomework(image) {
  const { base64, mimeType = 'image/jpeg', prompt = DEFAULT_PROMPT } = image ?? {};

  // Mock mode lets the whole UX run end-to-end without a backend or API key.
  if (ENV.USE_MOCK) {
    return mockSolve();
  }

  if (!base64) {
    throw new ApiError('No image data was provided to solveHomework().');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ENV.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENV.VISION_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // For a backend proxy, send a user/session token here — NOT a provider key.
        ...(ENV.VISION_API_KEY ? { Authorization: `Bearer ${ENV.VISION_API_KEY}` } : {}),
      },
      // Default body targets YOUR backend proxy. If your backend forwards
      // directly to a provider, reuse buildOpenAIPayload / buildGeminiPayload.
      body: JSON.stringify({ model: ENV.VISION_MODEL, mimeType, prompt, image: base64 }),
    });

    if (!response.ok) {
      throw new ApiError(`Vision API request failed (${response.status}).`, {
        status: response.status,
        cause: await safeText(response),
      });
    }

    const json = await response.json();
    const solution = extractSolution(json);
    if (!solution) {
      throw new ApiError('The Vision API response did not contain a solution.');
    }
    return { solution, raw: json };
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError('The request timed out. Please try again.');
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Could not reach the Vision API. Check your connection.', { cause: err });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Returns a realistic sample solution so the UI works without a backend. */
async function mockSolve() {
  await new Promise((resolve) => setTimeout(resolve, 1800));
  const solution = [
    '## Answer',
    "The derivative is $f'(x) = 6x + 5$.",
    '',
    '## Step-by-step',
    'We differentiate $f(x) = 3x^2 + 5x - 2$ term by term using the power rule',
    String.raw`$\frac{d}{dx}x^n = n\,x^{n-1}$:`,
    '',
    String.raw`1. $\frac{d}{dx}(3x^2) = 6x$`,
    String.raw`2. $\frac{d}{dx}(5x) = 5$`,
    String.raw`3. $\frac{d}{dx}(-2) = 0$`,
    '',
    'Summing the terms gives:',
    '',
    "$$f'(x) = 6x + 5$$",
    '',
    '> **Tip:** the constant term always differentiates to zero.',
    '',
    '```text',
    'This is a MOCK response. Set EXPO_PUBLIC_USE_MOCK=false and configure',
    'EXPO_PUBLIC_VISION_API_URL to call your real backend.',
    '```',
  ].join('\n');
  return { solution, raw: { mock: true } };
}
