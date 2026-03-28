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
  const response = await apiGet(path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}
