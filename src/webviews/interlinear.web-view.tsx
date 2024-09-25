import { Button } from 'platform-bible-react';
import { useCallback, useState } from 'react';
import { WebViewProps } from '@papi/core';
import papi from '@papi/frontend';

globalThis.webViewComponent = function Interlinear({ useWebViewState }: WebViewProps) {
  const [input, setInput] = useWebViewState('input', 'someInput');
  const [languages, setLanguages] = useWebViewState<string[]>('languages', []);

  const requestLanguages = useCallback(async () => {
    const results = await papi.commands.sendCommand('interlinear.getLanguagesFromDatabase', input);
    setLanguages(results);
  }, [input, setLanguages]);

  return (
    <>
      <div className="title">
        Biblica says, <span className="framework">hello world!</span> {languages}
      </div>

      <Button onClick={requestLanguages}>Request Languages</Button>
    </>
  );
};
