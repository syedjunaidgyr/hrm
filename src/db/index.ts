import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

import fs from "fs";
import path from "path";

const connectionUri = process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/recruitment_portal";

const caPath = path.resolve(process.cwd(), "ca.pem");
const sslConfig = fs.existsSync(caPath)
  ? { ca: fs.readFileSync(caPath) }
  : connectionUri.includes("aivencloud.com")
  ? { rejectUnauthorized: false }
  : undefined;

// Strip ssl-mode from URI to prevent mysql2 connection option warning
const cleanUri = connectionUri.replace(/[?&]ssl-mode=[^&]*/, "");

const pool = mysql.createPool({
  uri: cleanUri,
  connectionLimit: 10,
  multipleStatements: true,
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };
