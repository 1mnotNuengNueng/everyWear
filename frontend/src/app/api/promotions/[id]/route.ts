import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = apiUrl(`/api/promotions/${encodeURIComponent(id)}`);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return new NextResponse(text || response.statusText, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" },
    });
  }

  const json = (await response.json()) as unknown;
  return NextResponse.json(json);
}

