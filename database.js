const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// --- CYBER BRIDGE WRAPPER ---
// This emulates the sqlite3 API so we don't have to change any code in index.js
const db = {
    serialize: (fn) => fn(), // LibSQL is always serial
    run: (sql, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        client.execute({ sql, args: params || [] })
            .then(res => { if (cb) cb(null, res); })
            .catch(err => { if (cb) cb(err); });
    },
    get: (sql, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        client.execute({ sql, args: params || [] })
            .then(res => { if (cb) cb(null, res.rows[0]); })
            .catch(err => { if (cb) cb(err); });
    },
    all: (sql, params, cb) => {
        if (typeof params === 'function') { cb = params; params = []; }
        client.execute({ sql, args: params || [] })
            .then(res => { if (cb) cb(null, res.rows); })
            .catch(err => { if (cb) cb(err); });
    }
};

// INITIALIZE CLOUD SCHEMA
async function initSchema() {
    try {
        await client.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
        await client.execute("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, user_id INTEGER, app_name TEXT, score INTEGER, recommendations TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
        await client.execute("CREATE TABLE IF NOT EXISTS vault (id INTEGER PRIMARY KEY, user_id INTEGER, app_name TEXT, app_username TEXT, encrypted_password TEXT)");
        console.log("🛡️  Neural Database Sync: Cloud Nodes Operational.");
    } catch (e) {
        console.error("❌ Neural Database Sync Error: Check Turso Credentials.", e);
    }
}
initSchema();

module.exports = db;
