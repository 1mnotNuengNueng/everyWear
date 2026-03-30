export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return new URL(path, baseUrl);
}

export async function apiGet(path: string) {
  const url = apiUrl(path);
  try {
    return await fetch(url, { cache: "no-store" });
  } catch (error) {
    const hint =
      `API fetch failed (${url.toString()}). ` +
      `Is the backend running at ${getApiBaseUrl()}? ` +
      `Set NEXT_PUBLIC_API_BASE_URL in frontend/.env.local if needed.`;
    const wrapped = new Error(hint);
    (wrapped as unknown as { cause?: unknown }).cause = error;
    throw wrapped;
  }
}

export async function apiGetJson<T>(path: string): Promise<T> {
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (error) {
    const hint =
      `API fetch failed (${url.toString()}). ` +
      `Is the backend running at ${getApiBaseUrl()}? ` +
      `Set NEXT_PUBLIC_API_BASE_URL in frontend/.env.local if needed.`;
    const wrapped = new Error(hint);
    (wrapped as unknown as { cause?: unknown }).cause = error;
    throw wrapped;
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} (${url.toString()})${text ? ` - ${text}` : ""}`,
    );
  }
  return (await response.json()) as T;
}

export async function apiRequestJson<TResponse>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<TResponse> {
  const url = apiUrl(path);
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch (error) {
    const hint =
      `API fetch failed (${url.toString()}). ` +
      `Is the backend running at ${getApiBaseUrl()}? ` +
      `Set NEXT_PUBLIC_API_BASE_URL in frontend/.env.local if needed.`;
    const wrapped = new Error(hint);
    (wrapped as unknown as { cause?: unknown }).cause = error;
    throw wrapped;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
