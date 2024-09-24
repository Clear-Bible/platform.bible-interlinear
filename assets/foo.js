const Database = require('better-sqlite3');

// Function to initialize and interact with SQLite
function initializeDatabase() {
  try {
    // Create or open a SQLite database (you can specify the database file path)
    const db = new Database('example.db');

    // Create a table (if it doesn't already exist)
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `);

    // Insert a new user
    const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
    const info = stmt.run('John Doe');

    // Send a success message back to the parent process
    process.send(`User inserted with ID: ${info.lastInsertRowid}`);

    // Fetch all users and send the data to the parent process
    const rows = db.prepare('SELECT * FROM users').all();
    process.send(`Users: ${JSON.stringify(rows)}`);

    // Close the database connection
    db.close();
  } catch (error) {
    // Send error information to the parent process
    process.send(`Error: ${error.message}`);
  }
}

// Simulate some asynchronous initialization
setTimeout(() => {
  // Initialize the database when the process starts
  initializeDatabase();

  // Optionally, exit the child process after initialization
  process.exit(0);
}, 1000); // Simulate a short delay

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
