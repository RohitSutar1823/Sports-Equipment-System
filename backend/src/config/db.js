const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env from backend folder, root folder, or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'sports_equipment_db';

// Enable SSL automatically if DB_SSL=true or for common cloud MySQL hosts
const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  /aivencloud\.com|tidbcloud\.com|psdb\.cloud|filess\.io|clever-cloud\.com|railway\.app/i.test(
    connectionUri || dbHost
  );

let mysqlPool = null;
try {
  if (connectionUri) {
    mysqlPool = mysql.createPool({
      uri: connectionUri,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      multipleStatements: true,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
    });
  } else {
    mysqlPool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      multipleStatements: true,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
    });
  }
} catch (err) {
  console.warn('Could not create MySQL pool:', err.message);
}

let useSqlite = false;
let sqliteDb = null;

function initSqliteFallback() {
  const { DatabaseSync } = require('node:sqlite');
  const dbFilePath = path.resolve(__dirname, '../../database/sports_equipment.sqlite');
  const isNewFile = !fs.existsSync(dbFilePath);

  sqliteDb = new DatabaseSync(dbFilePath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  // Check if tables already exist
  const tableCheck = sqliteDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='STUDENT'")
    .all();

  if (isNewFile || tableCheck.length === 0) {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      const rawSchema = fs.readFileSync(schemaPath, 'utf8');
      const sqliteSchema = rawSchema
        .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+\w+\s*;/gi, '')
        .replace(/USE\s+\w+\s*;/gi, '')
        .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
      sqliteDb.exec(sqliteSchema);
    }

    if (fs.existsSync(seedPath)) {
      const rawSeed = fs.readFileSync(seedPath, 'utf8');
      const sqliteSeed = rawSeed
        .replace(/USE\s+\w+\s*;/gi, '')
        .replace(/SET\s+FOREIGN_KEY_CHECKS\s*=\s*0\s*;/gi, 'PRAGMA foreign_keys = OFF;')
        .replace(/SET\s+FOREIGN_KEY_CHECKS\s*=\s*1\s*;/gi, 'PRAGMA foreign_keys = ON;')
        .replace(/TRUNCATE\s+TABLE\s+(\w+)\s*;/gi, 'DELETE FROM $1;');
      sqliteDb.exec(sqliteSeed);
    }
    console.log('📦 Initialized SQLite database with schema.sql and seed.sql');
  }

  useSqlite = true;
  console.log('✅ Connected to built-in SQLite database (Cloud/Render zero-config fallback)');
}

async function autoMigrateMysqlIfNeeded(connection) {
  try {
    const [tables] = await connection.query("SHOW TABLES LIKE 'STUDENT'");
    if (tables.length === 0) {
      console.log('📦 Empty MySQL database detected. Running schema.sql and seed.sql...');
      const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs
          .readFileSync(schemaPath, 'utf8')
          .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+\w+\s*;/gi, '')
          .replace(/USE\s+\w+\s*;/gi, '');
        await connection.query(schemaSql);
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8').replace(/USE\s+\w+\s*;/gi, '');
        await connection.query(seedSql);
      }
      console.log('✅ MySQL schema and seed data initialized successfully!');
    }
  } catch (err) {
    console.warn('⚠️ Auto-migration check warning:', err.message);
  }
}

const sqliteAdapter = {
  async query(sql, params = []) {
    const cleanSql = sql.replace(/\s+FOR\s+UPDATE\b/gi, '');
    const normParams = (params || []).map((p) =>
      p === undefined ? null : typeof p === 'boolean' ? (p ? 1 : 0) : p
    );

    try {
      const stmt = sqliteDb.prepare(cleanSql);
      if (/^\s*(SELECT|SHOW|PRAGMA)\b/i.test(cleanSql)) {
        const rows = stmt.all(...normParams).map((r) => ({ ...r }));
        return [rows, []];
      } else {
        const result = stmt.run(...normParams);
        return [
          {
            insertId: Number(result.lastInsertRowid),
            affectedRows: Number(result.changes)
          },
          undefined
        ];
      }
    } catch (err) {
      if (err.message && /FOREIGN KEY constraint failed/i.test(err.message)) {
        err.code = 'ER_ROW_IS_REFERENCED_2';
      }
      throw err;
    }
  },

  async getConnection() {
    return {
      async beginTransaction() {
        sqliteDb.exec('BEGIN');
      },
      async commit() {
        sqliteDb.exec('COMMIT');
      },
      async rollback() {
        try {
          sqliteDb.exec('ROLLBACK');
        } catch (_) {
          // Ignore if no transaction is active
        }
      },
      release() {},
      query(sql, params) {
        return sqliteAdapter.query(sql, params);
      }
    };
  }
};

// Initialize connection on startup
const initPromise = (async () => {
  if (mysqlPool) {
    try {
      const connection = await mysqlPool.getConnection();
      console.log('✅ Successfully connected to MySQL database: ' + dbName);
      await autoMigrateMysqlIfNeeded(connection);
      connection.release();
      return;
    } catch (err) {
      console.warn('⚠️ MySQL connection unavailable (' + err.message + '). Falling back to SQLite...');
    }
  }
  initSqliteFallback();
})();

module.exports = {
  async query(sql, params) {
    await initPromise;
    if (useSqlite) {
      return sqliteAdapter.query(sql, params);
    }
    return mysqlPool.query(sql, params);
  },
  async getConnection() {
    await initPromise;
    if (useSqlite) {
      return sqliteAdapter.getConnection();
    }
    return mysqlPool.getConnection();
  }
};
