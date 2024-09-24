const Database = require('better-sqlite3');
const path = require('path');

let db = null;

// Function to initialize (open) the database and return a Promise
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      // Point to the prepopulated database in the assets folder
      const dbPath = path.join(process.cwd(), '../assets/clear-aligner.sqlite');
      console.log(`Opening database at: ${dbPath}`);

      // Open the existing SQLite database
      db = new Database(dbPath, { readonly: true }); // Set readonly: true if only reading

      process.send('Database initialized successfully');
      resolve();
    } catch (error) {
      process.send(`Error initializing database: ${error.message}`);
      reject(error);
    }
  });
}

// Function to run a select query on the database
function selectAllLanguages() {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Query to fetch all languages from the database
    const rows = db.prepare('SELECT * FROM language').all();
    process.send(`Languages from database: ${JSON.stringify(rows)}`);
  } catch (error) {
    process.send(`Error executing query: ${error.message}`);
  }
}

// Main function to initialize the DB and then run queries
async function main() {
  try {
    await initializeDatabase();
    selectAllLanguages();
  } catch (error) {
    process.send(`Error in main process: ${error.message}`);
  } finally {
    process.exit(0);
  }
}

main();
