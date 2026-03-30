import Link from "next/link";
import { apiGetJson } from "@/lib/api";

export const dynamic = "force-dynamic";

type OrderSummary = {
  id: number;
  status: string;
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
  // ดึงข้อมูลจาก API
  const orders = await apiGetJson<OrderSummary[]>("/api/orders");

  return (
    <div className="h-full flex flex-col">
      {/* ส่วนหัวของหน้า (Header) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการออเดอร์
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ดูรายการคำสั่งซื้อทั้งหมด และยอดรวมสุทธิ
          </p>
        </div>
        <div>
          <Link
            href="/orders/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition font-medium inline-flex items-center"
          >
            <span className="mr-2 text-lg">+</span> สร้างออเดอร์ใหม่
          </Link>
        </div>
      </div>

      {/* ส่วนตารางรายการออเดอร์ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        {/* หัวตาราง */}
        <div className="grid grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
          <div className="col-span-2">หมายเลขออเดอร์</div>
          <div className="col-span-2">สถานะ</div>
          <div className="col-span-5">วันที่ทำรายการ</div>
          <div className="col-span-3 text-right">ยอดสุทธิ</div>
        </div>

        {/* รายการออเดอร์ (Scrollable) */}
        <div className="overflow-y-auto flex-1">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <span className="text-4xl mb-2">📋</span>
              <p>ยังไม่มีออเดอร์ในระบบ</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="grid grid-cols-12 gap-3 px-6 py-4 text-sm hover:bg-blue-50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-2 font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      #{order.id}
                    </div>
                    <div className="col-span-2 flex items-center">
                      {order.status === "CANCELLED" ? (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          ยกเลิก
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          สำเร็จ
                        </span>
                      )}
                    </div>
                    <div className="col-span-5 text-gray-600 flex items-center">
                      {formatDateTime(order.orderDate)}
                    </div>
                    <div className="col-span-3 text-right font-black text-gray-800 flex items-center justify-end">
                      {formatMoney(order.netValue)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}