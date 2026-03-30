import { apiGetJson } from "@/lib/api";
import StockClient from "./_components/StockClient";

export const dynamic = "force-dynamic";

export type StockItem = {
  id: number;
  size: string;
  itemId: number;
  itemName: string;
  quantity: number;
  updatedAt: string | null;
};

export type Item = {
  id: number;
  name: string;
  price: number;
};

export default async function StockPage() {
  const [stocks, items] = await Promise.all([
    apiGetJson<StockItem[]>("/api/stock"),
    apiGetJson<Item[]>("/api/items"),   // ← แก้จาก /api/item เป็น /api/items
  ]);

  return <StockClient initialStocks={stocks} items={items} />;
}