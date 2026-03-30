import { NextRequest, NextResponse } from "next/server";

import { apiUrl } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;
    const backendUrl = apiUrl(`/api/coupons/code/${encodeURIComponent(code)}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the coupon service";

    return NextResponse.json({ message }, { status: 502 });
  }
}
