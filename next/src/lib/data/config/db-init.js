import path from "path";
import fs from "fs";

export function getDb() {
    const Database = require("better-sqlite3");

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = path.join(dataDir, "data.db");
    return new Database(dbPath);
}
