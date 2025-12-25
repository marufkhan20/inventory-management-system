"use client";

import TableSkeleton from "@/components/TableSkeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Revision, RevisionItem } from "@/generated/prisma/client";
import {
  completeRevision,
  getRevisionById,
  updateRevisionItemCount,
} from "@/lib/actions/revisions";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface RevisionType extends Revision {
  items: RevisionItem[];
}

function calculateItemLoss(
  expected: number,
  counted: number,
  costPrice: number
) {
  const actualCount = counted ?? expected;

  const difference = actualCount - expected;

  const shortage = Math.max(expected - actualCount, 0);
  const lossValue = shortage * costPrice;

  return {
    difference,
    lossValue,
  };
}

const Page = () => {
  const [revisionData, setRevisionData] = useState<RevisionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCountUpdating, setIsCountUpdating] = useState(false);
  const [updateCountId, setUpdateCountId] = useState<null | string>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const router = useRouter();

  const params = useParams();
  const id = params.id as string; // Get the ID from the URL

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { data } = await getRevisionById(id);
    console.log("data", data);
    setRevisionData(data || null);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    (() => fetchData())();
  }, [fetchData]);

  // create new revision
  const udpateRevisionCount = async () => {
    try {
      setIsCountUpdating(true);
      const result = await updateRevisionItemCount(
        updateCountId || "",
        updateCount
      );
      if (result.success) {
        setIsCountUpdating(false);

        const updatedItems =
          revisionData &&
          revisionData.items.map((item) => {
            if (item.id === updateCountId) {
              return { ...item, countedQuantity: updateCount }; // Return a new object
            }
            return item;
          });

        if (updatedItems) {
          setRevisionData({
            ...revisionData,
            items: updatedItems,
          });
        }

        setUpdateCount(0);
        setUpdateCountId("");

        toast.success("Count updated successfully.");
      } else {
        setIsCountUpdating(false);
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      setIsCountUpdating(false);
      console.log("error", error);
    }
  };

  const currentTotalLoss = useMemo(() => {
    if (!revisionData?.items) return 0;

    return revisionData.items.reduce((sum, item) => {
      // Use the logic: Loss = max(Expected - Counted, 0) * Price
      const expected = item.expectedQuantity;
      const counted = item.countedQuantity ?? expected; // Default to expected if null

      const shortage = Math.max(expected - counted, 0);
      const itemLoss = shortage * item.costPrice;

      return sum + itemLoss;
    }, 0);
  }, [revisionData]);

  const saveAsDraft = () => {
    setIsSavingDraft(true);
    setTimeout(() => {
      toast.success("Revision save as draft");
      router.push("/revisions");
      setIsSavingDraft(false);
    }, 500);
  };

  const completeRevisionHandler = async () => {
    try {
      setIsCompleting(true);
      const result = await completeRevision(revisionData?.id || "");
      if (result.success) {
        setIsCompleting(false);

        router.push("/revisions");
        toast.success("Revision completed.");
      } else {
        setIsCountUpdating(false);
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      setIsCountUpdating(false);
      console.log("error", error);
    }
  };
  return (
    <div>
      <div className="flex items-center gap-12">
        <button
          className="flex items-center gap-2 text-primary text-sm cursor-pointer"
          onClick={() => router.push("/revisions")}
        >
          <ArrowLeft className="size-4" />
          Back to revisions
        </button>
        <p className="text-sm text-secondary">
          Status:{" "}
          <span
            className={
              revisionData?.status === "COMPLETED"
                ? "text-[#166534]"
                : "text-secondary"
            }
          >
            {revisionData?.status}
          </span>{" "}
          Total loss:{" "}
          <span className="text-danger">-${currentTotalLoss.toFixed(2)}</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col gap-6 mt-6">
        <h2 className="font-normal">Items in revision</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 w-full pb-4">
                  Item
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Expected
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Counted
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Difference
                </th>
                <th className="text-xs font-medium tracking-wider text-secondary pr-6 whitespace-nowrap pb-4">
                  Loss value
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton col={5} />
            ) : revisionData?.items && revisionData?.items?.length > 0 ? (
              <tbody>
                {revisionData?.items.map((item) => {
                  const { difference, lossValue } = calculateItemLoss(
                    item.expectedQuantity,
                    item.countedQuantity || 0,
                    item.costPrice
                  );
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="text-sm text-main pr-6 py-4">
                        {item.itemName}
                      </td>
                      <td className="text-sm text-main pr-6 py-4">
                        {item.expectedQuantity}
                      </td>
                      <td
                        className="text-sm text-main pr-6 py-4"
                        onClick={
                          revisionData?.status === "DRAFT"
                            ? () => {
                                setUpdateCountId(item.id);
                                setUpdateCount(item?.countedQuantity || 0);
                              }
                            : () => {}
                        }
                      >
                        {updateCountId && updateCountId === item.id ? (
                          <div className="relative w-20">
                            {" "}
                            {/* Wrapper to position the spinner */}
                            <Input
                              value={updateCount}
                              onChange={(e) =>
                                setUpdateCount(Number(e.target.value))
                              }
                              onBlur={udpateRevisionCount}
                              className={`w-full p-1 px-3 ${
                                isCountUpdating ? "pr-8 opacity-70" : ""
                              }`}
                              disabled={isCountUpdating}
                              autoFocus
                            />
                            {isCountUpdating && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        ) : (
                          item.countedQuantity
                        )}
                      </td>
                      <td
                        className={`text-sm ${
                          difference < 0 ? "text-danger" : "text-main"
                        } pr-6 py-4`}
                      >
                        {difference}
                      </td>
                      <td className="text-sm text-main py-4  flex justify-end pr-4">
                        {lossValue > 0 ? `-$${lossValue}` : `$${lossValue}`}
                      </td>
                    </tr>
                  );
                })}
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

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-main py-4  flex justify-end pr-4">
              Total loss:
            </p>
            <p className="text-sm text-danger py-4  flex justify-end pr-4">
              -${currentTotalLoss.toFixed(2)}
            </p>
          </div>

          {revisionData?.status === "DRAFT" && (
            <div className="mt-4 flex items-center gap-4">
              <Button
                className="bg-secondary font-normal flex items-center justify-center gap-2"
                onClick={saveAsDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft && <Loader2 className="size-4 animate-spin" />}
                Save as draft
              </Button>

              <Button
                onClick={completeRevisionHandler}
                disabled={isCompleting}
                className="font-normal flex items-center justify-center gap-2"
              >
                {isCompleting && <Loader2 className="size-4 animate-spin" />}{" "}
                Complete revision
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
