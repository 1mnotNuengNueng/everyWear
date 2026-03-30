import { NextRequest, NextResponse } from "next/server";

import { apiUrl } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = apiUrl("/api/coupons/validate");

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
      error instanceof Error
        ? error.message
        : "Unable to reach the coupon validation service";

    return NextResponse.json({ message }, { status: 502 });
  }
}
