import papi, { logger } from '@papi/backend';
import {
  ExecutionActivationContext,
  IWebViewProvider,
  SavedWebViewDefinition,
  WebViewDefinition,
} from '@papi/core';
import interlinearExtension from './webviews/interlinear.web-view?inline';
import interlinearStyles from './webviews/interlinear.web-view.css?inline';

// eslint-disable-next-line
console.log(process.env.NODE_ENV);

const reactWebViewType = 'paranextExtensionTemplate.react';

const reactWebViewProvider: IWebViewProvider = {
  async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
    if (savedWebView.webViewType !== reactWebViewType)
      throw new Error(
        `${reactWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`,
      );
    return {
      ...savedWebView,
      title: 'Interlinear',
      content: interlinearExtension,
      styles: interlinearStyles,
    };
  },
};

export async function activate(context: ExecutionActivationContext) {
  logger.info('Interlinear is activating!');

  const getLanguagesFromDatabasePromise = papi.commands.registerCommand(
    'interlinear.getLanguagesFromDatabase',
    async (input) => {
      if (!input) throw new Error('Must provide a prompt!');

      // Send the message to the forked process to fetch languages
      return new Promise((resolve, reject) => {
        childProcess.stdin.write('selectAllLanguages'); // Trigger the query in database.js

        // Listen for the message with the query results
        childProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString();
          if (message.startsWith('Languages from database:')) {
            const languages = JSON.parse(message.replace('Languages from database: ', ''));
            resolve(languages);
          } else if (message.startsWith('Error')) {
            reject(new Error(message));
          }
        });
      });
    },
  );

  const getVerseTextFromDatabasePromise = papi.commands.registerCommand(
    'interlinear.getVerseTextFromDatabase',
    async (verseRef) => {
      if (!verseRef) throw new Error('Must provide a verseRef!');

      return new Promise((resolve, reject) => {
        childProcess.stdin.write(JSON.stringify({ command: 'selectVerseText', input: verseRef }));

        childProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString();
          console.log('message = ', message);
          if (message.startsWith('VerseText from database:')) {
            var verseText = {};
            try {
              verseText = JSON.parse(message.replace('VerseText from database: ', ''));
            } catch (error) {
              console.log('json parse failed:', error);
            }
            resolve(verseText);
          } else if (message.startsWith('Error')) {
            reject(new Error(message));
          }
        });
      });
    },
  );

  const { executionToken } = context;
  const { createProcess } = context.elevatedPrivileges;
  if (!createProcess)
    throw new Error('MAIN - Forgot to add "createProcess" to "elevatePrivileges" in manifest.json');
  //const childProcess = createProcess.fork(executionToken, 'assets/database.js');

  const exePath = __dirname + '/../assets/database-win.exe';
  //const exePath = __dirname + '/../assets/database-linux';
  //const exePath = __dirname + '/../assets/database-macos';
  console.log(`MAIN - Executable Path: ${exePath}`);
  const childProcess = createProcess.spawn(executionToken, exePath, [], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  childProcess.stdout.on('data', (data: Buffer) => {
    const message = data.toString();
    console.log('MAIN - received message from child: ', message);
  });

  childProcess.on('error', (error) => {
    logger.error(`MAIN - Failed to start subprocess: ${error}`);
  });

  childProcess.on('exit', (code: number, signal: string) => {
    logger.info(`MAIN - Child process exited with code ${code} and signal ${signal}`);
  });

  const reactWebViewProviderPromise = papi.webViewProviders.register(
    reactWebViewType,
    reactWebViewProvider,
  );

  papi.webViews.getWebView(reactWebViewType, undefined, { existingId: '?' });

  context.registrations.add(
    await reactWebViewProviderPromise,
    await getLanguagesFromDatabasePromise,
    await getVerseTextFromDatabasePromise,
  );

  logger.info('MAIN - Interlinear is finished activating!');
}

export async function deactivate() {
  logger.info('MAIN - Interlinear is deactivating!');
  return true;
}
