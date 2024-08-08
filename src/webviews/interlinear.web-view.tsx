import { Button } from 'platform-bible-react';

globalThis.webViewComponent = function Interlinear() {
  return (
    <>
      <div className="title">
        Biblica says, <span className="framework">hello world!</span>
      </div>

      <Button>Easy button</Button>
    </>
  );
};
