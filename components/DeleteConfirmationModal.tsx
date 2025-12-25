import { AlertTriangle, Loader2 } from "lucide-react";
import Button from "./ui/Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md scale-100 bg-white p-8 shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="size-8" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-main">Delete Item?</h3>
          <p className="mb-8 text-sm text-secondary leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-main">&quot;{itemName}&quot;</span>?
            This action cannot be undone and will remove the item from your db
            records.
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 bg-gray-100 text-secondary hover:bg-gray-200 border-none"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Item"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
