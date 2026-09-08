import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, pool } from "./index";

async function main() {
  console.log("Running Drizzle migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Drizzle migrations completed successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
