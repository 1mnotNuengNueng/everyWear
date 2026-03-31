import { NextRequest, NextResponse } from "next/server";

import { apiUrl } from "@/lib/api";

type OrderDetailResponse = {
  id: number;
  netValue: string | number | null;
};

type RewardCouponResponse = {
  id: number;
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  status: string;
  createdAt: string | null;
  usedAt: string | null;
};

const COOP_COUPON_API_URL =
  process.env.COOP_COUPON_API_URL ??
  "https://soa-project-production.up.railway.app/api/coupons";

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const numberValue = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getRewardConfig(netValue: number | null) {
  if (netValue === null) return null;
  if (netValue >= 500) {
    return { discountPercent: 25, maxDiscountAmount: 250 };
  }
  if (netValue >= 250) {
    return { discountPercent: 10, maxDiscountAmount: 100 };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const orderResponse = await fetch(apiUrl("/api/orders"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!orderResponse.ok) {
      const text = await orderResponse.text();
      return new NextResponse(text, {
        status: orderResponse.status,
        headers: {
          "Content-Type": orderResponse.headers.get("Content-Type") ?? "application/json",
        },
      });
    }

    const order = (await orderResponse.json()) as OrderDetailResponse;
    const rewardConfig = getRewardConfig(toNumber(order.netValue));

    let rewardCoupon: RewardCouponResponse | null = null;

    if (rewardConfig) {
      const rewardResponse = await fetch(COOP_COUPON_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rewardConfig),
        cache: "no-store",
      });

      if (rewardResponse.ok) {
        rewardCoupon = (await rewardResponse.json()) as RewardCouponResponse;
      }
    }

    return NextResponse.json({
      order,
      rewardCoupon,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete checkout";

    return NextResponse.json({ message }, { status: 502 });
  }
}
