import { NextRequest, NextResponse } from "next/server";

import { apiUrl } from "@/lib/api";

type CategoryOption = {
  id: number;
  name: string;
};

type CouponLookupResponse = {
  id: number;
  code: string;
  expireDate: string | null;
  active: boolean;
  createdAt: string | null;
  promotionId: number;
  promotionName: string;
  discountValue: string | number | null;
  allowedCategoryIds?: number[] | null;
  allowedCategories?: Array<{ id: number; name: string }> | null;
};

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
    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        },
      });
    }

    const coupon = (await response.json()) as CouponLookupResponse;

    if (!coupon.allowedCategories || coupon.allowedCategories.length === 0) {
      const categoriesResponse = await fetch(apiUrl("/api/categories"), {
        method: "GET",
        cache: "no-store",
      });

      if (categoriesResponse.ok) {
        const categories = (await categoriesResponse.json()) as CategoryOption[];
        const categoryNameMap = new Map(
          categories.map((category) => [category.id, category.name]),
        );

        coupon.allowedCategories = (coupon.allowedCategoryIds ?? [])
          .map((categoryId) => {
            const categoryName = categoryNameMap.get(categoryId);
            return categoryName ? { id: categoryId, name: categoryName } : null;
          })
          .filter(
            (category): category is { id: number; name: string } => category !== null,
          );
      }
    }

    return NextResponse.json(coupon);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the coupon service";

    return NextResponse.json({ message }, { status: 502 });
  }
}
