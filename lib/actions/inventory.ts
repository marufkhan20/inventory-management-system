"use server";

import {
  InventorySchema,
  type InventoryInput,
} from "@/validation/inventorySchema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "../auth";
import prisma from "../prisma";

export async function getInventoryItems(
  page: number = 1,
  pageSize: number = 25,
  query: string = ""
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return { error: "Unauthorized", data: [], total: 0 };

  try {
    const skip = (page - 1) * pageSize;

    // Define the search filter
    const searchFilter = {
      userId: session.user.id,
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { category: { contains: query, mode: "insensitive" as const } },
      ],
    };

    // Run both queries in parallel for better performance
    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where: searchFilter,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: pageSize,
      }),
      prisma.inventory.count({
        where: searchFilter,
      }),
    ]);

    return { data: items, total };
  } catch (error) {
    console.error("Error getting inventories", error);
    return { error: "Failed to fetch items", data: [], total: 0 };
  }
}

export async function createInventoryItem(values: InventoryInput) {
  // 1. Get the session/user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  // 2. The Guard: If no userId, stop here
  if (!userId) {
    return { error: "You must be logged in to create an item." };
  }

  // 3. Server-side validation check
  const validatedFields = InventorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, category, inStock, price, minStock } = validatedFields.data;

  console.log("instock", inStock);

  try {
    await prisma.inventory.create({
      data: {
        userId,
        name,
        category,
        inStock: parseFloat(inStock),
        purchasePrice: price,
        minStock: parseFloat(minStock),
        status: inStock <= minStock ? "Low" : "OK",
      },
    });

    revalidatePath("/inventory"); // Refresh the table
    return { success: true };
  } catch (error) {
    console.error("error of creating inventory", error);
    return { error: "Something went wrong in the database." };
  }
}

// UPDATE ACTION
export async function updateInventoryItem(id: string, values: InventoryInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validatedFields = InventorySchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, category, inStock, price, minStock } = validatedFields.data;

  try {
    await prisma.inventory.update({
      where: { id, userId: session.user.id }, // Security: Must match user
      data: {
        name,
        category,
        inStock: parseFloat(inStock),
        purchasePrice: price,
        minStock: parseFloat(minStock),
        status: inStock <= minStock ? "Low" : "OK",
      },
    });
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("error update inventory", error);
    return { error: "Failed to update item" };
  }
}

// DELETE ACTION
export async function deleteInventoryItem(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const deletedItem = await prisma.inventory.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/inventory");
    return { success: true, item: deletedItem };
  } catch (error) {
    console.error("error deleting inventory", error);
    return { error: "Failed to delete item" };
  }
}
