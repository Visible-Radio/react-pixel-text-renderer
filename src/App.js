import './App.css';
import TextRenderer from './components/TextRenderer';

function App() {
  return (
    <div className="App">
      <TextRenderer
        bgColor = {'rgba(0,10,50,1)'}
        text={"it's good it's bad its ugly it's a pixel text renderer."}
        scale={20}
        charSpaces={8}
        animate={true}
      />
    </div>
  );
}

export default App;
