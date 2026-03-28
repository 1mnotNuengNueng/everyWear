import Link from "next/link";

import { apiGetJson } from "@/lib/api";

export const dynamic = "force-dynamic";

type OrderSummary = {
  id: number;
  orderDate: string | null;
  totalPrice: string | number | null;
  discountAmount: string | number | null;
  netValue: string | number | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numberValue)) return String(value);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(numberValue);
}

export default async function OrdersPage() {
  const orders = await apiGetJson<OrderSummary[]>("/api/orders");

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              ออเดอร์
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              เลือกออเดอร์เพื่อดูรายละเอียดสินค้าและยอดรวม
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders/new"
              className="h-10 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              สร้างออเดอร์
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-50"
            >
              กลับหน้าแรก
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <div className="col-span-2">Order</div>
            <div className="col-span-4">วันที่</div>
            <div className="col-span-2 text-right">ก่อนลด</div>
            <div className="col-span-2 text-right">ส่วนลด</div>
            <div className="col-span-2 text-right">สุทธิ</div>
          </div>

          {orders.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
              ยังไม่มีออเดอร์
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="grid grid-cols-12 gap-3 px-4 py-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <div className="col-span-2 font-medium text-zinc-900 dark:text-zinc-50">
                      #{order.id}
                    </div>
                    <div className="col-span-4 text-zinc-700 dark:text-zinc-200">
                      {formatDateTime(order.orderDate)}
                    </div>
                    <div className="col-span-2 text-right text-zinc-700 dark:text-zinc-200">
                      {formatMoney(order.totalPrice)}
                    </div>
                    <div className="col-span-2 text-right text-zinc-700 dark:text-zinc-200">
                      {formatMoney(order.discountAmount)}
                    </div>
                    <div className="col-span-2 text-right font-medium text-zinc-900 dark:text-zinc-50">
                      {formatMoney(order.netValue)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
