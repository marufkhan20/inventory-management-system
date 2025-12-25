"use client";

import AddInventoryModal from "@/components/AddInventoryModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import TableSkeleton from "@/components/TableSkeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Inventory } from "@/generated/prisma/client";
import {
  deleteInventoryItem,
  getInventoryItems,
} from "@/lib/actions/inventory";
import { ChevronLeft, ChevronRight, Edit3, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const [items, setItems] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
    const { data, total } = await getInventoryItems(
      currentPage,
      pageSize,
      debouncedQuery
    );
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

  // 1. Add these states to your Page component
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 2. The trigger function
  const openDeleteConfirm = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  // 3. The execution function
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const res = await deleteInventoryItem(itemToDelete.id);

    if (res.success) {
      toast.success(`${res.item?.name} deleted successfully.`);
      setIsDeleteModalOpen(false);
      fetchItems(); // Refresh the table
    } else {
      alert("Error deleting item");
    }
    setIsDeleting(false);
  };

  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // 2. Open edit function
  const handleEditClick = (item: Inventory) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  // 3. Close handler (Reset the editing state)
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
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
                <th className="text-xs font-medium tracking-wider text-secondary whitespace-nowrap pb-4 text-end">
                  Action
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
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item.id, item.name)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
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
          handleCloseModal();
        }}
        refetch={fetchItems}
        initialData={editingItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Page;
