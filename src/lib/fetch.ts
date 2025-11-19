/**
 * Frontend fetch helpers (to be used in admin panels)
 * - fetchWithTimeout: aborts request after timeout
 * - fetchWithTimeoutRetry: retry + backoff wrapper suitable for UI calls
 */

export async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeoutMs = 30_000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function fetchWithTimeoutRetry(
  input: RequestInfo,
  init: RequestInit = {},
  timeoutMs = 30_000,
  retries = 2,
  backoffMs = 300
): Promise<Response> {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(input, init, timeoutMs);
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await new Promise(res => setTimeout(res, backoffMs * (attempt + 1)));
    }
  }
  throw lastError;
}
