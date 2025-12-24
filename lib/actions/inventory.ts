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
  pageSize: number = 25
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return { error: "Unauthorized", data: [], total: 0 };

  try {
    const skip = (page - 1) * pageSize;

    // Run both queries in parallel for better performance
    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: pageSize,
      }),
      prisma.inventory.count({
        where: { userId: session.user.id },
      }),
    ]);

    return { data: items, total };
  } catch (error) {
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

  try {
    const newItem = await prisma.inventory.create({
      data: {
        userId,
        name,
        category,
        inStock,
        purchasePrice: price,
        minStock,
        status: inStock <= minStock ? "Low" : "OK",
      },
    });

    console.log("new Item", newItem);

    revalidatePath("/inventory"); // Refresh the table
    return { success: true };
  } catch (error) {
    return { error: "Something went wrong in the database." };
  }
}
