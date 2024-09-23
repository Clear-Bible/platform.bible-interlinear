import papi, { logger } from '@papi/backend';

// import { VerseRef } from '@sillsdev/scripture';
import {
  DataProviderUpdateInstructions,
  ExecutionActivationContext,
  IDataProviderEngine,
  IWebViewProvider,
  SavedWebViewDefinition,
  WebViewContentType,
  WebViewDefinition,
} from '@papi/core';
//
// import type {
//   DoStuffEvent,
//   ExtensionVerseDataTypes,
//   ExtensionVerseSetData,
// } from 'paranext-extension-template-hello-world';
// import extensionTemplateReact from './extension-template.web-view?inline';
// import extensionTemplateReact2 from './extension-template-2.web-view?inline';
// import extensionTemplateReactStyles from './extension-template.web-view.scss?inline';
// import extensionTemplateHtml from './extension-template-html.web-view.html?inline';
//
import interlinearExtension from './webviews/interlinear.web-view?inline';
import interlinearStyles from './webviews/interlinear.web-view.css?inline';

// eslint-disable-next-line
console.log(process.env.NODE_ENV);

const reactWebViewType = 'paranextExtensionTemplate.react';

/** Simple web view provider that provides React web views when papi requests them */
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

// const reactWebViewType2 = 'paranextExtensionTemplate.react2';

/** Simple web view provider that provides React web views when papi requests them */
// const reactWebViewProvider2: IWebViewProvider = {
//   async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
//     if (savedWebView.webViewType !== reactWebViewType2)
//       throw new Error(
//         `${reactWebViewType2} provider received request to provide a ${savedWebView.webViewType} web view`,
//       );
//     return {
//       ...savedWebView,
//       title: 'Extension Template Hello World React 2',
//       content: extensionTemplateReact2,
//       styles: extensionTemplateReactStyles,
//     };
//   },
// };

export async function activate(context: ExecutionActivationContext) {
  logger.info('Interlinear is activating!');

  const { executionToken } = context;
  const { createProcess } = context.elevatedPrivileges;
  if (!createProcess)
    throw new Error('Forgot to add "createProcess" to "elevatePrivileges" in manifest.json');
  const childProcess = createProcess.fork(executionToken, 'assets/foo.js');

  childProcess.send('PARENT TO CHILD MESSAGE');

  // Listen for messages from the child process
  childProcess.on('message', (message: any) => {
    logger.info(`Received message from child process: ${message}`);

    // Handle the received message
    //if (message === 'Task completed') {
    //  logger.info('The child process has completed its task.');
    //} else {
    //  logger.info(`Child process sent: ${message}`);
    //}
  });

  // Handle child process exit events
  childProcess.on('exit', (code: number, signal: string) => {
    logger.info(`Child process exited with code ${code} and signal ${signal}`);
  });

  //createProcess.spawn(executionToken, 'font-manager', [], { stdio: [null, null, null] });
  // const warning = await papi.storage.readTextFileFromInstallDirectory(
  //   context.executionToken,
  //   'assets/heresy-warning.txt',
  // );
  // const engine = new QuickVerseDataProviderEngine(warning.trim());

  // let storedHeresyCount: number = 0;
  // try {
  //   // If a user has never been a heretic, there is nothing to read
  //   const loadedData = await papi.storage.readUserData(context.executionToken, 'heresy-count');
  //   if (loadedData) storedHeresyCount = Number(loadedData);
  // } catch (error) {
  //   logger.debug(error);
  // }
  // engine.heresyCount = storedHeresyCount;

  // const quickVerseDataProviderPromise = papi.dataProviders.registerEngine(
  //   'paranextExtensionTemplate.quickVerse',
  //   engine,
  // );

  // const htmlWebViewProviderPromise = papi.webViewProviders.register(
  //   htmlWebViewType,
  //   htmlWebViewProvider,
  // );

  const reactWebViewProviderPromise = papi.webViewProviders.register(
    reactWebViewType,
    reactWebViewProvider,
  );

  // const reactWebViewProvider2Promise = papi.webViewProviders.register(
  //   reactWebViewType2,
  //   reactWebViewProvider2,
  // );

  // Emitter to tell subscribers how many times we have done stuff
  // const onDoStuffEmitter = papi.network.createNetworkEventEmitter<DoStuffEvent>(
  //   'extensionTemplateHelloWorld.doStuff',
  // );

  // let doStuffCount = 0;
  // const doStuffCommandPromise = papi.commands.registerCommand(
  //   'extensionTemplateHelloWorld.doStuff',
  //   (message: string) => {
  //     doStuffCount += 1;
  //     // Inform subscribers of the update
  //     onDoStuffEmitter.emit({ count: doStuffCount });

  //     // Respond to the sender of the command with the news
  //     return {
  //       response: `The template did stuff ${doStuffCount} times! ${message}`,
  //       occurrence: doStuffCount,
  //     };
  //   },
  // );

  // Create WebViews or get an existing WebView if one already exists for this type
  // Note: here, we are using `existingId: '?'` to indicate we do not want to create a new WebView
  // if one already exists. The WebView that already exists could have been created by anyone
  // anywhere; it just has to match `webViewType`. See `paranext-core's hello-someone.ts` for an
  // example of keeping an existing WebView that was specifically created by
  // `paranext-core's hello-someone`.
  // papi.webViews.getWebView(htmlWebViewType, undefined, { existingId: '?' });
  papi.webViews.getWebView(reactWebViewType, undefined, { existingId: '?' });
  // papi.webViews.getWebView(reactWebViewType2, undefined, { existingId: '?' });

  // Await the data provider promise at the end so we don't hold everything else up
  context.registrations
    .add
    // await quickVerseDataProviderPromise,
    // await htmlWebViewProviderPromise,
    // await reactWebViewProviderPromise,
    // await reactWebViewProvider2Promise,
    // onDoStuffEmitter,
    // await doStuffCommandPromise,
    ();

  logger.info('Interlinear is finished activating!');
}

export async function deactivate() {
  logger.info('Interlinear is deactivating!');
  return true;
}
