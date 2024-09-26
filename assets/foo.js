const Database = require('better-sqlite3');
const path = require('path');

let db = null;

// Function to initialize (open) the database and return a Promise
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const dbPath = path.join(process.cwd(), '../assets/clear-aligner.sqlite');
      console.log(`Opening database at: ${dbPath}`);

      db = new Database(dbPath, { readonly: true });
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

    const rows = db.prepare('SELECT * FROM language').all();
    process.send(`Languages from database: ${JSON.stringify(rows)}`);
  } catch (error) {
    process.send(`Error executing query: ${error.message}`);
  }
}

function handleQuery(message) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    switch (message) {
      case 'selectAllLanguages':
        selectAllLanguages();
        break;
      default:
        process.send({ event: 'error', message: `Unknown query: ${message}` });
    }
  } catch (error) {
    process.send({ event: 'error', message: error.message });
  }
}

async function main() {
  try {
    await initializeDatabase();
    process.on('message', (message) => {
      console.log(`child received message: ${message}`);
      handleQuery(message);
    });
  } catch (error) {
    process.send({ event: 'error', message: `Error in main process: ${error.message}` });
  }
}

main();
