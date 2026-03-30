export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export function apiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return new URL(path, baseUrl);
}

export async function apiGet(path: string) {
  const url = apiUrl(path);
  return await fetch(url, { cache: "no-store" });
}

export async function apiGetJson<T>(path: string): Promise<T> {
  const url = apiUrl(path);
  const response = await fetch(url, { cache: "no-store" });
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
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });

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
