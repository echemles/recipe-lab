"use client";

import { useEffect, useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types/grocery";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CATEGORY_ORDER: GroceryCategory[] = [
  "produce",
  "meat-fish",
  "dairy",
  "pantry",
  "frozen",
  "other",
];

const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: "Produce",
  "meat-fish": "Meat & Fish",
  dairy: "Dairy",
  pantry: "Pantry",
  frozen: "Frozen",
  other: "Other",
};

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const response = await fetch("/api/grocery");
      if (!response.ok) {
        throw new Error("Failed to fetch grocery items");
      }
      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePurchased(id: string, currentStatus: boolean) {
    try {
      const response = await fetch("/api/grocery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          updates: { isPurchased: !currentStatus },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const { item } = await response.json();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? item : i))
      );
    } catch (err) {
      console.error("Error toggling purchased status:", err);
    }
  }

  async function removeItem(id: string) {
    try {
      const response = await fetch(`/api/grocery?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  }

  async function clearPurchased() {
    try {
      const response = await fetch("/api/grocery?clearPurchased=true", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear purchased items");
      }

      setItems((prev) => prev.filter((i) => !i.isPurchased));
    } catch (err) {
      console.error("Error clearing purchased items:", err);
    }
  }

  function startEditing(item: GroceryItem) {
    setEditingId(item.id);
    setEditQuantity(item.quantity.toString());
  }

  async function saveQuantity(id: string) {
    const parsed = parseFloat(editQuantity);
    if (isNaN(parsed) || parsed <= 0) {
      setEditingId(null);
      return;
    }

    try {
      const response = await fetch("/api/grocery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          updates: { quantity: parsed },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const { item } = await response.json();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? item : i))
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setEditingId(null);
    }
  }

  const groupedItems = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = items.filter((item) => item.category === category);
    return acc;
  }, {} as Record<GroceryCategory, GroceryItem[]>);

  const purchasedCount = items.filter((i) => i.isPurchased).length;

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4">
        <div className="w-full max-w-2xl">
          <p className="text-center text-muted">Loading grocery list...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4">
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grocery List</h1>
            <p className="text-sm text-muted mt-1">
              {items.length === 0
                ? "No items yet"
                : `${items.length} ${items.length === 1 ? "item" : "items"}`}
              {purchasedCount > 0 && ` · ${purchasedCount} purchased`}
            </p>
          </div>
          {purchasedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearPurchased}>
              Clear purchased
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted">
              Your grocery list is empty. Add items from a recipe to get started.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {CATEGORY_ORDER.map((category) => {
              const categoryItems = groupedItems[category];
              if (categoryItems.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold mb-3 text-muted">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-4 transition-opacity ${
                          item.isPurchased ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={item.isPurchased}
                            onChange={() => togglePurchased(item.id, item.isPurchased)}
                            className="mt-1 h-4 w-4 rounded border-border cursor-pointer"
                            aria-label={`Mark ${item.ingredientName} as purchased`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium ${
                                item.isPurchased ? "line-through" : ""
                              }`}
                            >
                              {item.ingredientName}
                            </p>
                            {item.packageDescription && (
                              <p className="text-sm text-muted mt-1">
                                {item.packageDescription}
                              </p>
                            )}
                            {item.sourceRecipeTitle && (
                              <p className="text-xs text-muted mt-1">
                                From: {item.sourceRecipeTitle}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {editingId === item.id ? (
                              <>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  onBlur={() => saveQuantity(item.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      saveQuantity(item.id);
                                    } else if (e.key === "Escape") {
                                      setEditingId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="w-20 px-2 py-1 text-sm border border-border rounded bg-surface-1 text-foreground"
                                />
                                <span className="text-sm text-muted min-w-[3rem]">
                                  {item.unit}
                                </span>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(item)}
                                  className="text-sm hover:text-foreground text-muted"
                                >
                                  {item.quantity} {item.unit}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-muted hover:text-foreground ml-2"
                              aria-label="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
