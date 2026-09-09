import { mysqlTable, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { vendors } from "./vendors";

export const vendors_updated = vendors; // re-export alias not needed; update in place

// NOTE: This file only adds contactName. The actual table is vendors.ts.
// Export for reference:
export {};
