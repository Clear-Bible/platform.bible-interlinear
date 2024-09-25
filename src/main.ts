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
      console.log('Input!');
      var output = [input, input];
      return output;
    },
  );

  const { executionToken } = context;
  const { createProcess } = context.elevatedPrivileges;
  if (!createProcess)
    throw new Error('Forgot to add "createProcess" to "elevatePrivileges" in manifest.json');
  const childProcess = createProcess.fork(executionToken, 'assets/foo.js');

  childProcess.send('selectAllLanguages');

  childProcess.on('message', (message: any) => {
    console.log('received message from child: ', message);
  });

  childProcess.on('exit', (code: number, signal: string) => {
    logger.info(`Child process exited with code ${code} and signal ${signal}`);
  });

  const reactWebViewProviderPromise = papi.webViewProviders.register(
    reactWebViewType,
    reactWebViewProvider,
  );

  papi.webViews.getWebView(reactWebViewType, undefined, { existingId: '?' });

  context.registrations.add(
    await reactWebViewProviderPromise,
    await getLanguagesFromDatabasePromise,
  );
  // await quickVerseDataProviderPromise,
  // await htmlWebViewProviderPromise,
  // await reactWebViewProvider2Promise,
  // onDoStuffEmitter,
  // await doStuffCommandPromise,

  logger.info('Interlinear is finished activating!');
}

export async function deactivate() {
  logger.info('Interlinear is deactivating!');
  return true;
}
