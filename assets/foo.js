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

function handleQuery(message) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    switch (message) {
      case 'selectAllLanguages':
        selectAllLanguages();

      default:
        process.send({ event: 'error', message: `Unknown query: ${message.query}` });
    }
  } catch (error) {
    process.send({ event: 'error', message: error.message });
  }
}

// Main function to initialize the DB and then run queries
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

/*
process.on('message', (message) => {
  console.log('Message from parent:', message);
  process.send('CHILD TO PARENT MESSAGE');
});

// Handle cleanup if the child process is terminated
process.on('exit', () => {
  console.log('Child process is exiting...');
});

// Optional error handling
process.on('error', (err) => {
  console.error('An error occurred in the child process:', err);
});
*/
