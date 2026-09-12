import { mysqlTable, varchar, customType } from "drizzle-orm/mysql-core";

const mediumblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "mediumblob";
  },
});

export const fileBlobs = mysqlTable("file_blobs", {
  storageKey: varchar("storage_key", { length: 500 }).primaryKey(),
  content: mediumblob("content").notNull(),
});
