import { NextRequest, NextResponse } from "next/server";
import {
  getAllGroceryItems,
  addGroceryItems,
  updateGroceryItem,
  deleteGroceryItem,
  findExistingGroceryItem,
  clearPurchasedItems,
} from "@/data/groceryStore";
import { GroceryItemInput } from "@/types/grocery";

export async function GET() {
  try {
    const items = await getAllGroceryItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching grocery items:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid items array" },
        { status: 400 }
      );
    }

    const itemsToAdd: GroceryItemInput[] = [];
    const mergedItems: { id: string; quantity: number }[] = [];

    for (const item of items) {
      const existing = await findExistingGroceryItem(item.ingredientName);
      
      if (existing && existing.unit === item.unit) {
        const newQuantity = existing.quantity + item.quantity;
        await updateGroceryItem(existing.id, { quantity: newQuantity });
        mergedItems.push({ id: existing.id, quantity: newQuantity });
      } else {
        itemsToAdd.push(item);
      }
    }

    const addedItems = await addGroceryItems(itemsToAdd);

    return NextResponse.json({
      added: addedItems,
      merged: mergedItems,
    });
  } catch (error) {
    console.error("Error adding grocery items:", error);
    return NextResponse.json(
      { error: "Failed to add grocery items" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const updatedItem = await updateGroceryItem(id, updates);

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating grocery item:", error);
    return NextResponse.json(
      { error: "Failed to update grocery item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearPurchased = searchParams.get("clearPurchased");

    if (clearPurchased === "true") {
      const deletedCount = await clearPurchasedItems();
      return NextResponse.json({ deletedCount });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Item ID required" },
        { status: 400 }
      );
    }

    const success = await deleteGroceryItem(id);

    if (!success) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grocery item:", error);
    return NextResponse.json(
      { error: "Failed to delete grocery item" },
      { status: 500 }
    );
  }
}
