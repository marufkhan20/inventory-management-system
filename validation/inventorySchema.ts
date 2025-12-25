import { z } from "zod";

export const InventorySchema = z.object({
  name: z.string().min(2, "Name is too short"),
  category: z.string().min(2, "Category is required"),
  inStock: z.coerce.string().min(0, "Cannot be negative"),
  price: z.string().min(1, "Price is required"),
  minStock: z.coerce.string().min(0, "Cannot be negative"),
});

export type InventoryInput = z.infer<typeof InventorySchema>;
