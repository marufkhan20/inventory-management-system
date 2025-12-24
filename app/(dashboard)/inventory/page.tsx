"use client";

import AddInventoryModal from "@/components/AddInventoryModal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Inventory } from "@/generated/prisma/client";
import { getInventoryItems } from "@/lib/actions/inventory";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const Page = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const { data, total } = await getInventoryItems(currentPage, pageSize);
    setItems(data || []);
    setTotalItems(total || 0);
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {
    (() => fetchItems())();
  }, [fetchItems]);

  // Calculate range labels
  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Input
          className="w-100 text-left text-sm"
          placeholder="Search Items..."
        />
        <Button
          className="flex items-center gap-1 text-xs font-normal"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="size-4" /> Add item
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 mt-6">
        <h2 className="font-normal">All Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 w-full pb-4">
                  Item
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Category
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  In stock
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Purchase price
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Min stock
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary whitespace-nowrap pb-4">
                  Status
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton />
            ) : items.length > 0 ? (
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="text-sm text-main pr-6 py-4">{item.name}</td>
                    <td className="text-sm text-main pr-6 py-4">
                      {item.category}
                    </td>
                    <td className="text-sm text-main pr-6 py-4">
                      {item.inStock}
                    </td>
                    <td className="text-sm text-main pr-6 py-4">
                      {item.purchasePrice}
                    </td>
                    <td className="text-sm text-main pr-6 py-4">
                      {item.minStock}
                    </td>
                    <td className="text-sm text-main py-4  flex justify-end">
                      <span
                        className={`py-2 px-3 rounded-full text-white inline-flex leading-none text-[10px] font-bold ${
                          item.status === "OK" ? "bg-green-700" : "bg-red-600"
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-end gap-6 pt-4 border-t border-gray-50 text-sm text-secondary">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <span className="font-medium text-main">{pageSize}</span>
          </div>

          <div>
            {startRange}–{endRange} of {totalItems}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <AddInventoryModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchItems(); // Refresh list after adding
        }}
      />
    </div>
  );
};

export default Page;

const TableSkeleton = () => (
  <tbody className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-gray-50">
        <td className="py-4 pr-6">
          <div className="h-4 bg-gray-200 rounded w-32" />
        </td>
        <td className="py-4 pr-6">
          <div className="h-4 bg-gray-200 rounded w-20" />
        </td>
        <td className="py-4 pr-6">
          <div className="h-4 bg-gray-200 rounded w-12" />
        </td>
        <td className="py-4 pr-6">
          <div className="h-4 bg-gray-200 rounded w-16" />
        </td>
        <td className="py-4 pr-6">
          <div className="h-4 bg-gray-200 rounded w-12" />
        </td>
        <td className="py-4">
          <div className="h-6 bg-gray-200 rounded-full w-12" />
        </td>
      </tr>
    ))}
  </tbody>
);
