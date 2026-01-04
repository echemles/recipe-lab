import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "recipe_lab";

if (!uri) {
  console.error("Missing MONGODB_URI environment variable.");
  process.exit(1);
}

const sampleRecipe = {
  title: "Charred Broccolini with Lemon Tahini",
  description:
    "Tender charred broccolini tossed in a bright lemon-tahini dressing and topped with crunchy pistachios.",
  ingredients: [
    { quantity: 2, unit: "bunches", name: "broccolini" },
    { quantity: 2, unit: "tbsp", name: "olive oil" },
    { quantity: 1, unit: "tsp", name: "kosher salt" },
    { quantity: 0.5, unit: "tsp", name: "black pepper" },
    { quantity: 3, unit: "tbsp", name: "tahini" },
    { quantity: 2, unit: "tbsp", name: "lemon juice", note: "fresh" },
    { quantity: 1, unit: "clove", name: "garlic", note: "grated" },
    { quantity: 2, unit: "tbsp", name: "pistachios", note: "chopped" }
  ],
  steps: [
    "Preheat a grill pan or skillet over medium-high heat.",
    "Toss broccolini with olive oil, salt, and pepper, then char 2-3 minutes per side until crisp-tender.",
    "Whisk tahini, lemon juice, garlic, and 2 tbsp water into a pourable dressing.",
    "Plate broccolini, drizzle with dressing, and top with pistachios before serving."
  ],
  prepTimeMinutes: 10,
  cookTimeMinutes: 8,
  servings: 4,
  tags: ["vegetarian", "sides", "weeknight"],
};

async function main() {
  const client = new MongoClient(uri);
  const now = new Date().toISOString();
  try {
    await client.connect();
    const collection = client.db(dbName).collection("recipes");

    const result = await collection.insertOne({
      ...sampleRecipe,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Inserted sample recipe with id:", result.insertedId.toHexString());
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Failed to insert sample recipe:", err);
  process.exit(1);
});
