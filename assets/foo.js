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

// Function to run a select query on the database
function selectVerseText(verseRef) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const rows = db
      .prepare(
        `SELECT * FROM words_or_parts WHERE position_book = ${verseRef.bookNum} AND position_chapter = ${verseRef.chapterNum} AND position_verse = ${verseRef.verseNum} AND (corpus_id = 'sbl-gnt' OR corpus_id = 'wlc-hebot')`,
        //"SELECT wop2.* FROM words_or_parts wop1 JOIN links__source_words lsw ON wop1.id = lsw.word_id JOIN links__target_words ltw ON lsw.link_id = ltw.link_id JOIN words_or_parts wop2 ON ltw.word_id = wop2.id WHERE wop1.position_book = 40 AND wop1.position_chapter = 1 AND wop1.position_verse = 1 AND (wop1.corpus_id = 'sbl-gnt' OR wop1.corpus_id = 'wlc-hebot')",
        /*`
        WITH initial_words AS (
            -- Step 1: Get the initial words
            SELECT id, gloss, text
            FROM words_or_parts
            WHERE position_book = 40
              AND position_chapter = 1
              AND position_verse = 1
              AND corpus_id IN ('sbl-gnt', 'wlc-hebot')
        ),
        matched_words AS (
            -- Step 2: Find all rows in words_or_parts with matching text (case-insensitive)
            SELECT w.id AS original_id, w.gloss, w.text, m.id AS matched_id
            FROM initial_words w
            JOIN words_or_parts m ON LOWER(w.text) = LOWER(m.text)
        ),
        source_links AS (
            -- Step 3: Find the source links in links__source_words using matched ids
            SELECT mw.original_id, mw.gloss, mw.text, ls.link_id
            FROM matched_words mw
            JOIN links__source_words ls ON mw.matched_id = ls.word_id
        ),
        target_words AS (
            -- Step 4: Find the target words using link_id in links__target_words
            SELECT sl.original_id, sl.gloss, sl.text, lt.word_id
            FROM source_links sl
            JOIN links__target_words lt ON sl.link_id = lt.link_id
        ),
        linked_texts AS (
            -- Step 5: Get the text for each word_id found and determine the most common text (case-insensitive)
            SELECT tw.original_id, tw.gloss, tw.text, LOWER(wp.text) AS linked_text,
                  COUNT(*) AS frequency
            FROM target_words tw
            JOIN words_or_parts wp ON tw.word_id = wp.id
            GROUP BY tw.original_id, tw.gloss, tw.text, LOWER(wp.text)
        ),
        most_common_text AS (
            -- Step 6: Find the most common linked text for each original word
            SELECT original_id, gloss, text, linked_text
            FROM linked_texts lt
            WHERE (lt.original_id, lt.frequency) IN (
                SELECT original_id, MAX(frequency)
                FROM linked_texts
                GROUP BY original_id
            )
        )
        -- Final result: Original words with the most common linked text (case-insensitive)
        SELECT original_id, gloss, text, linked_text
        FROM most_common_text;
        `*/
      )
      .all();
    process.send(`VerseText from database: ${JSON.stringify(rows)}`);
  } catch (error) {
    process.send(`Error executing query: ${error.message}`);
  }
}

function handleQuery(message) {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    switch (message.command) {
      case 'selectAllLanguages':
        selectAllLanguages();
        break;
      case 'selectVerseText':
        selectVerseText(message.input);
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
