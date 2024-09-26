import { Button } from 'platform-bible-react';
import { useCallback, useState } from 'react';
import { WebViewProps } from '@papi/core';
import papi from '@papi/frontend';

globalThis.webViewComponent = function Interlinear({ useWebViewState }: WebViewProps) {
  const [input, setInput] = useWebViewState('input', 'someInput');
  const [languages, setLanguages] = useWebViewState<
    { code: string; text_direction: string; font_family: string }[]
  >('languages', []);

  // Function to request languages from the database
  const requestLanguages = useCallback(async () => {
    const results = await papi.commands.sendCommand('interlinear.getLanguagesFromDatabase', input);
    console.log('results = ', results);
    setLanguages(results);
  }, [input, setLanguages]);

  return (
    <>
      <div className="title">
        Biblica says, <span className="framework">hello world!</span>
      </div>

      <Button onClick={requestLanguages}>Request Languages</Button>

      {/* Display the languages in a table */}
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
                <td>{language.font_family || 'N/A'}</td> {/* Handle empty font_family */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {languages.length === 0 && <p>No languages available. Click the button to load them!</p>}
    </>
  );
};
