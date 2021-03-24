import './App.css';
import React from 'react';
//import TextRenderer from 'react-pixel-text-renderer';
import TextRenderer from './TextRenderer';


function App() {
  return (
    <div className="App">
      <TextRenderer
        bgColor = {'rgba(0,10,50,1)'}
        text={"it's good it's bad its ugly."}
        scale={10}
        charSpaces={11}
        animate={true}
        scaleMode={'auto'}
      />
    </div>
  );
}

export default App;
