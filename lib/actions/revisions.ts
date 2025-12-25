"use server";

import { RevisionStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "../prisma";

export async function getAllRevisions({
  page = 1,
  limit = 5,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  const skip = (page - 1) * limit;

  try {
    // We filter by status (Draft/Completed) based on the search string
    const searchStatus = search.toUpperCase();
    const whereClause = {
      userId: session.user.id,
      // We filter by status (DRAFT or COMPLETED)
      OR: [
        {
          status: searchStatus as RevisionStatus,
        },
      ],
    };

    // If search is empty, just filter by userId to show everything
    const finalWhere =
      search === "" ? { userId: session.user.id } : whereClause;

    const [revisions, totalCount] = await Promise.all([
      prisma.revision.findMany({
        where: finalWhere, // Use the filter here
        orderBy: { date: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          date: true,
          status: true,
          itemsCounted: true,
          totalLoss: true,
        },
      }),
      prisma.revision.count({ where: finalWhere }), // Use the filter here too
    ]);

    return {
      success: true,
      data: revisions,
      total: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch revisions" };
  }
}

// GET SINGLE REVISION (For the Details/Edit Page)
export async function getRevisionById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const revision = await prisma.revision.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: { itemName: "asc" },
        },
      },
    });

    if (!revision) return { error: "Revision not found" };

    return { success: true, data: revision };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch revision details" };
  }
}

export async function createNewRevision() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Get all current inventory items for this user
    const inventoryItems = await prisma.inventory.findMany({
      where: { userId: session.user.id },
    });

    if (inventoryItems.length === 0) {
      return { error: "No inventory items found to revise." };
    }

    // 2. Create the Revision parent record
    const revision = await prisma.revision.create({
      data: {
        userId: session.user.id,
        status: "DRAFT",
        itemsCounted: inventoryItems.length,
        // 3. Create all RevisionItems in one go (The Snapshot)
        items: {
          create: inventoryItems.map((item) => ({
            inventoryId: item.id,
            itemName: item.name,
            expectedQuantity: item.inStock,
            costPrice: parseFloat(item.purchasePrice), // Store current price
            countedQuantity: item.inStock, // Default counted to expected for easier UX
          })),
        },
      },
    });

    revalidatePath("/revisions");
    return { success: true, id: revision.id };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create revision" };
  }
}

export async function updateRevisionItemCount(
  itemId: string,
  newCount: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the specific item
      const updatedItem = await tx.revisionItem.update({
        where: { id: itemId },
        data: { countedQuantity: parseFloat(newCount) },
        include: { revision: true },
      });

      const revisionId = updatedItem.revisionId;

      // 2. Fetch all items for this revision to calculate the NEW total loss
      const allItems = await tx.revisionItem.findMany({
        where: { revisionId },
      });

      const newTotalLoss = allItems.reduce((sum, item) => {
        const expected = item.expectedQuantity;
        const counted = item.countedQuantity ?? expected;
        const shortage = Math.max(expected - counted, 0);
        return sum + shortage * item.costPrice;
      }, 0);

      // 3. Update the Parent Revision record
      await tx.revision.update({
        where: { id: revisionId },
        data: {
          totalLoss: newTotalLoss,
          // Update the itemsCounted count if needed
          itemsCounted: allItems.filter((i) => i.countedQuantity !== null)
            .length,
        },
      });

      return { success: true, data: updatedItem, error: null };
    });

    return result;
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update count" };
  }
}

export async function completeRevision(revisionId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the revision and its items
    const revision = await tx.revision.findUnique({
      where: { id: revisionId },
      include: { items: true },
    });

    if (!revision || revision.status === "COMPLETED") {
      throw new Error("Revision not found or already completed");
    }

    let runningTotalLoss = 0;

    // 2. Loop through items and update the main Inventory
    if (revision) {
      for (const item of revision.items) {
        const expected = item.expectedQuantity;
        const counted = item.countedQuantity ?? expected; // Fallback to expected if null

        // Calculate loss: Only treat shortages (Expected > Counted) as loss
        if (counted < expected) {
          const shortage = expected - counted;
          const itemLoss = shortage * item.costPrice;
          runningTotalLoss += itemLoss;
        }

        // 3. Update the main Inventory stock to the newly Counted value
        // 1. Fetch the inventory item to get its minStock value
        const inventoryItem = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
          select: { minStock: true }, // Only fetch what we need
        });

        if (!inventoryItem) continue;

        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            inStock: counted,
            status: counted < inventoryItem.minStock ? "LOW" : "OK",
          },
        });
      }
    }

    // 3. Mark revision as COMPLETED
    await tx.revision.update({
      where: { id: revisionId },
      data: { status: "COMPLETED", totalLoss: runningTotalLoss },
    });

    revalidatePath("/revisions");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  });
}

export async function deleteRevision(revisionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const revision = await tx.revision.findUnique({
        where: { id: revisionId },
      });

      if (!revision) throw new Error("Revision not found");

      // 3. Delete all related RevisionItems first
      await tx.revisionItem.deleteMany({
        where: { revisionId: revisionId },
      });

      // 4. Delete the parent Revision
      await tx.revision.delete({
        where: { id: revisionId },
      });
    });

    // 5. Refresh the UI
    revalidatePath("/revisions");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("DELETE_REVISION_ERROR:", error);
    return { success: false, error: "Failed to delete revision" };
  }
}
