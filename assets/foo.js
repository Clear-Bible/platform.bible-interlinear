const Database = require('better-sqlite3');
const path = require('path');

let db = null;

// Function to initialize (open) the database and return a Promise
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const dbPath = path.join(process.cwd(), '../assets/clear-aligner.sqlite');
      //for release use assets/clear-aligner.sqlite not ../assets/clear-aligner.sqlite
      //we have to compile better-sqlite3 for the electron version used in paranext-core using `npm run rebuild` as defined in package.json
      //run extension in dev mode
      //then run `npm run package`
      //unzip the package and copy in the node_modules folder
      //in paranext-core at C:\Users\rober\Documents\GitHub\paranext-core\release\build\win-unpacked> run .\Platform.Bible.exe --inspect-brk=5858 --remote-debugging-port=9223 --extensions C:\Users\rober\Documents\GitHub\platform.bible-interlinear\release\interlinear_0.0.1
      //we cannot zip the file for release, the node modules are too many

      console.log(`Opening database at: ${dbPath}`);

      db = new Database(dbPath, { readonly: true });
      process.stdout.write('Database initialized successfully');
      resolve();
    } catch (error) {
      process.stdout.write(`Error initializing database: ${error.message}`);
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
    process.stdout.write(`Languages from database: ${JSON.stringify(rows)}`);
  } catch (error) {
    process.stdout.write(`Error executing query: ${error.message}`);
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
        //`SELECT * FROM words_or_parts WHERE position_book = ${verseRef.bookNum} AND position_chapter = ${verseRef.chapterNum} AND position_verse = ${verseRef.verseNum} AND (corpus_id = 'sbl-gnt' OR corpus_id = 'wlc-hebot')`,
        `
        WITH TargetLinks AS (
    SELECT
        lw.link_id,
        w.text AS target_text
    FROM
        links__target_words lw
    JOIN
        words_or_parts w ON lw.word_id = w.id
),
SourceTokens AS (
    SELECT
        id,
        text,
        gloss,
        position_book,
        position_chapter,
        position_verse
    FROM
        words_or_parts
    WHERE
        position_book = ${verseRef.bookNum}
        AND position_chapter = ${verseRef.chapterNum}
        AND position_verse = ${verseRef.verseNum}
        AND (corpus_id = 'sbl-gnt' OR corpus_id = 'wlc-hebot')
)
SELECT
    st.id,
    st.text,
    st.gloss,
    -- Find the most common target token text
    (SELECT
        tt.target_text
     FROM
        TargetLinks tt
     JOIN
        links__source_words ls ON tt.link_id = ls.link_id
     WHERE
        ls.word_id IN (
            SELECT id
            FROM SourceTokens st2
            WHERE st2.text = st.text
        )
     GROUP BY
        tt.target_text
     ORDER BY
        COUNT(*) DESC
     LIMIT 1) AS most_common_target_text
FROM
    SourceTokens st;


        `,
      )
      .all();
    process.stdout.write(`VerseText from database: ${JSON.stringify(rows)}`);
  } catch (error) {
    process.stdout.write(`Error executing query: ${error.message}`);
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
        process.stdout.write(
          `${JSON.stringify({ event: 'error', message: `Unknown query: ${message}` })}`,
        );
    }
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ event: 'error', message: error.message })}`);
  }
}

async function main() {
  try {
    await initializeDatabase();
    process.stdin.on('data', (data) => {
      console.log(`child received message: ${data}`);
      var message = JSON.parse(data);
      handleQuery(message);
    });
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({ event: 'error', message: `Error in main process: ${error.message}` })}`,
    );
  }
}

main();
