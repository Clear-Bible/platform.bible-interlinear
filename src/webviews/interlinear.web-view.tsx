import { Button } from 'platform-bible-react';
import { useCallback, useState } from 'react';
import { WebViewProps } from '@papi/core';
import papi from '@papi/frontend';

globalThis.webViewComponent = function Interlinear({ useWebViewState }: WebViewProps) {
  const [input, setInput] = useWebViewState('input', 'someInput');

  const [languages, setLanguages] = useWebViewState<
    { code: string; text_direction: string; font_family: string }[]
  >('languages', []);
  const requestLanguages = useCallback(async () => {
    const results = await papi.commands.sendCommand('interlinear.getLanguagesFromDatabase', input);
    console.log('languages results = ', results);
    setLanguages(results);
  }, [input, setLanguages]);

  const [verseText, setVerseText] = useWebViewState<{ id: string; text: string; gloss: string }[]>(
    'verseText',
    [],
  );
  const requestVerseText = useCallback(async () => {
    const results = await papi.commands.sendCommand('interlinear.getVerseTextFromDatabase', input);
    console.log('verseText results = ', results);
    setVerseText(results);
  }, [input, setVerseText]);

  return (
    <>
      <Button onClick={requestVerseText}>Request VerseText</Button>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {verseText.map((item) => (
          <div key={item.id} style={{ margin: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{item.text}</div>
            <div style={{ color: 'gray' }}>{item.gloss}</div>
          </div>
        ))}
      </div>

      <Button onClick={requestLanguages}>Request Languages</Button>
      {languages.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Text Direction</th>
              <th>Font Family</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((language, index) => (
              <tr key={index}>
                <td>{language.code}</td>
                <td>{language.text_direction}</td>
                <td>{language.font_family || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {languages.length === 0 && <p>No languages available. Click the button to load them!</p>}
    </>
  );
};
