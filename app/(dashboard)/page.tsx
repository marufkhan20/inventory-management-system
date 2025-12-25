"use client";

import TableSkeleton from "@/components/TableSkeleton";
import { Inventory, RevisionStatus } from "@/generated/prisma/client";
import { getInventoryItems } from "@/lib/actions/inventory";
import { getAllRevisions } from "@/lib/actions/revisions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type RevisionSummary = {
  id: string;
  date: Date;
  status: RevisionStatus;
  totalLoss: number;
  itemsCounted: number;
};

const Page = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [revisionsData, setRevisionsData] = useState<RevisionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevisionsLoading, setIsRevisionsLoading] = useState(true);

  const router = useRouter();

  const pageSize = 4;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const { data } = await getInventoryItems(1, pageSize);
    setItems(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (() => fetchItems())();
  }, [fetchItems]);

  // get recent revisions
  const fetchRecentRevisions = useCallback(async () => {
    setIsRevisionsLoading(true);
    const { data } = await getAllRevisions({
      page: 1,
      limit: 5,
      search: "",
    });
    setRevisionsData(data || []);
    setIsRevisionsLoading(false);
  }, []);

  useEffect(() => {
    (() => fetchRecentRevisions())();
  }, [fetchRecentRevisions]);
  return (
    <div>
      <div className="flex gap-6 flex-wrap">
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            TOTAL REVENUE
          </h4>
          <h2 className="text-xl font-semibold">$84,500</h2>
          <p className="text-xs text-secondary font-medium">
            vs last 7 days: <span className="text-[#16A34A]">+12%</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            TOTAL COST
          </h4>
          <h2 className="text-xl font-semibold">$43,000</h2>
          <p className="text-xs text-secondary font-medium">
            vs last 7 days: <span className="text-[#16A34A]">-3%</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col gap-2">
          <h4 className="text-xs uppercase font-semibold text-secondary">
            GROSS PROFIT
          </h4>
          <h2 className="text-xl font-semibold">$49,450</h2>
          <p className="text-xs text-secondary font-medium">
            Margin: <span className="text-[#16A34A]">61%</span>
          </p>
        </div>
      </div>

      <div className="flex gap-6 mt-10 flex-wrap">
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 h-fit">
          <h2 className="font-normal">Inventory overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-medium tracking-wider text-secondary pr-4">
                    Item
                  </th>
                  <th className="text-xs font-medium tracking-wider text-secondary pr-4">
                    In stock
                  </th>
                  <th className="text-xs font-medium tracking-wider text-secondary">
                    Min stock
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton col={3} />
              ) : items.length > 0 ? (
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="text-sm text-main pr-6 py-4">
                        {item.name}
                      </td>
                      <td className="text-sm text-main pr-6 py-4">
                        {item.inStock}
                      </td>
                      <td className="text-sm text-main pr-6 py-4">
                        {item.minStock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-secondary text-sm"
                    >
                      No items found. Add your first item!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <Link href="/inventory" className="text-primary text-sm">
            View full inventory
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col h-fit">
          <h2 className="font-normal">Recent Revisions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {isRevisionsLoading ? (
                <TableSkeleton col={3} />
              ) : revisionsData.length > 0 ? (
                <tbody>
                  {revisionsData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/revisions/${item.id}`)}
                    >
                      <td className="text-sm text-main pr-6 py-4">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(item.date))}
                      </td>
                      <td className="text-xs text-main py-5 pr-6 flex items-center font-medium gap-1">
                        <span
                          className={
                            item.status === "COMPLETED"
                              ? "text-green-700"
                              : "text-[#6B7280]"
                          }
                        >
                          {item.status}
                        </span>
                        - {item.itemsCounted} items
                      </td>
                      <td
                        className={`${
                          item.status === "COMPLETED" && item.totalLoss > 0
                            ? "text-[#b91c1c]"
                            : "text-main"
                        } text-xs py-4`}
                      >
                        {item.totalLoss > 0
                          ? `-$${item.totalLoss}`
                          : `$${item.totalLoss}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-secondary text-sm"
                    >
                      No revisions found. Add your first revision!
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
