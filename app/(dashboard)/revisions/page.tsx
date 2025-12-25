"use client";

import TableSkeleton from "@/components/TableSkeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { RevisionStatus } from "@/generated/prisma/client";
import { createNewRevision, getAllRevisions } from "@/lib/actions/revisions";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type RevisionSummary = {
  id: string;
  date: Date;
  status: RevisionStatus;
  totalLoss: number;
  itemsCounted: number;
};

const Page = () => {
  const [items, setItems] = useState<RevisionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const router = useRouter();

  // Handle Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const { data, total } = await getAllRevisions({
      page: currentPage,
      limit: pageSize,
      search: debouncedQuery,
    });
    setItems(data || []);
    setTotalItems(total || 0);
    setIsLoading(false);
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    (() => fetchItems())();
  }, [fetchItems]);

  // Calculate range labels
  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.ceil(totalItems / pageSize);

  // create new revision
  const createRevision = async () => {
    try {
      setIsCreating(true);
      const result = await createNewRevision();
      if (result.success) {
        setIsCreating(false);
        router.push(`/revisions/${result.id}`);
        await fetchItems();
        toast.success("Revision created successfully.");
      } else {
        setIsCreating(false);
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      setIsCreating(false);
      console.log("error", error);
    }
  };
  return (
    <div>
      <div className="flex items-center gap-4">
        <Input
          className="w-100 text-left text-sm"
          placeholder="Search Items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="flex items-center gap-2 text-xs font-normal"
          onClick={createRevision}
          disabled={isCreating}
        >
          {isCreating && <Loader2 className="size-4 animate-spin" />}
          <Plus className="size-4" /> New Revision
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 mt-6">
        <h2 className="font-normal">All revisions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 w-full pb-4">
                  Date
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Items counted
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Total loss
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Status
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton col={7} />
            ) : items.length > 0 ? (
              <tbody>
                {items.map((item) => (
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
                    <td className="text-sm text-main pr-6 py-4">
                      {item.itemsCounted}
                    </td>
                    <td
                      className={`${
                        item.status === "COMPLETED" && item.totalLoss > 0
                          ? "text-[#b91c1c]"
                          : "text-main"
                      } "text-sm pr-6 py-4"`}
                    >
                      {item.totalLoss > 0
                        ? `-₸${item.totalLoss.toFixed(2)}`
                        : `₸${item.totalLoss.toFixed(2)}`}
                    </td>
                    <td className="text-sm text-main py-4  flex justify-end">
                      <span
                        className={`py-2 px-3 rounded-full text-white inline-flex leading-none text-xs ${
                          item.status === "COMPLETED"
                            ? "bg-green-700"
                            : "bg-[#6B7280]"
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
                    No revisions found. Add your first revision!
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
    </div>
  );
};

export default Page;
