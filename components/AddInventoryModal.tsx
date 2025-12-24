"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Inventory } from "@/generated/prisma/client";
import {
  createInventoryItem,
  updateInventoryItem,
} from "@/lib/actions/inventory"; // We will create this next
import {
  InventorySchema,
  type InventoryInput,
} from "@/validation/inventorySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  initialData?: Inventory | null;
}

const AddInventoryModal = ({
  isOpen,
  onClose,
  refetch,
  initialData,
}: ModalProps) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(InventorySchema),
    defaultValues: {
      inStock: 0,
      minStock: 0,
      category: "",
      name: "",
      price: "",
    },
  });

  // Update form values when initialData changes or modal opens
  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        name: initialData.name,
        category: initialData.category,
        inStock: initialData.inStock,
        minStock: initialData.minStock,
        price: initialData.purchasePrice,
      });
    } else if (!isOpen) {
      reset({
        inStock: 0,
        minStock: 0,
        category: "",
        name: "",
        price: "",
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: InventoryInput) => {
    try {
      const result = isEditing
        ? await updateInventoryItem(initialData.id, data)
        : await createInventoryItem(data);
      if (result.success) {
        if (isEditing) {
          toast.success("Inventory item updated successfully.");
        } else {
          toast.success("Inventory item created successfully.");
        }
        reset();
        refetch();
        onClose();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="text-lg font-medium text-main">
            {isEditing ? `Update Item` : "Add New Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary text-primary-hover transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-secondary tracking-wider">
              Item Name
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Rum Havana"
              className="w-full text-left py-3"
            />
            {errors.name && (
              <p className="text-red-500 text-[10px] font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                Category
              </label>
              <Input
                {...register("category")}
                placeholder="Vodka"
                className="w-full text-left py-3"
              />
              {errors.category && (
                <p className="text-red-500 text-[10px] font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                In Stock
              </label>
              <Input
                {...register("inStock")}
                type="number"
                placeholder="0"
                className="w-full text-left py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                Purchase Price
              </label>
              <Input
                {...register("price")}
                placeholder="$0.00"
                className="w-full text-left py-3"
              />
              {errors.price && (
                <p className="text-red-500 text-[10px] font-medium">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-secondary uppercase tracking-wider">
                Min Stock
              </label>
              <Input
                {...register("minStock")}
                type="number"
                placeholder="10"
                className="w-full text-left py-3"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-100 text-main hover:bg-gray-200 font-normal px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`font-normal px-8 text-white flex items-center gap-2 ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInventoryModal;
