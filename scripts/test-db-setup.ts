import { MongoClient } from "mongodb";
import getClientPromise from "@/lib/mongodb";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: '.env.local' });

const SEED_RECIPES = [
  {
    title: "Test Recipe Alpha",
    description: "A test recipe for E2E testing - first seed recipe",
    ingredients: [
      { quantity: 2, unit: "cups", name: "flour", note: "all-purpose" },
      { quantity: 1, unit: "cup", name: "sugar" },
      { quantity: 2, unit: "tsp", name: "baking powder" }
    ],
    steps: [
      "Mix dry ingredients together",
      "Add wet ingredients and mix well",
      "Bake at 350°F for 30 minutes"
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 8,
    tags: ["test", "baking", "simple"]
  },
  {
    title: "Test Recipe Beta",
    description: "A test recipe for E2E testing - second seed recipe",
    ingredients: [
      { quantity: 1, unit: "lb", name: "ground beef" },
      { quantity: 1, unit: "onion", name: "onion", note: "diced" },
      { quantity: 2, unit: "cups", name: "tomato sauce" }
    ],
    steps: [
      "Brown the ground beef",
      "Add diced onion and cook until soft",
      "Add tomato sauce and simmer for 20 minutes"
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    tags: ["test", "dinner", "meat"]
  }
];

async function resetAndSeedDatabase() {
  try {
    const client = await getClientPromise();
    const dbName = process.env.MONGODB_DB_TEST || 
      ((process.env.NODE_ENV === "test" ? `${process.env.MONGODB_DB}_test` : process.env.MONGODB_DB) ?? 
      "recipe_lab");
    
    console.log(`Connecting to database: ${dbName}`);
    
    // Drop the entire test database
    await client.db(dbName).dropDatabase();
    console.log("Dropped test database");
    
    // Insert seed recipes
    const db = client.db(dbName);
    const collection = db.collection("recipes");
    
    const now = new Date().toISOString();
    const recipesWithTimestamps = SEED_RECIPES.map(recipe => ({
      ...recipe,
      createdAt: now,
      updatedAt: now
    }));
    
    const result = await collection.insertMany(recipesWithTimestamps);
    console.log(`Inserted ${result.insertedCount} seed recipes`);
    
    // Verify insertion
    const count = await collection.countDocuments();
    console.log(`Total recipes in database: ${count}`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error("Database setup failed:", error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  resetAndSeedDatabase()
    .then(() => {
      console.log("Database setup completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database setup failed:", error);
      process.exit(1);
    });
}

export { resetAndSeedDatabase };
