import './App.css';
import { useEffect } from 'react';
import defs from './new/customDefs_charWidth_7.json';
import { asyncTextRenderer, syncTextRenderer } from './new/wrapperFunctions';

const joke =
  'Welcome to <HL>Node <HL>pixel <HL>text <HL>renderer v0.0.1. init charset. ...';
const end = ' Charset initialized. ... Hello world\nHello\n<HL>Hello <HL>world';
const text = (joke + Object.keys(defs).join(' ') + end).toUpperCase();
const threeCoopers = '<HL>/Cooper/ cooper/cooper/'.toUpperCase();

function App() {
  useEffect(() => {
    asyncTextRenderer({
      columns: 12,
      displayRows: 4,
      scale: 5,
      text: threeCoopers,
      defs,
    });
    // syncTextRenderer({
    //   columns: 15,
    //   displayRows: 5,
    //   scale: 3,
    //   text: (joke + Object.keys(defs).join(" ") + end).toUpperCase(),
    //   defs,
    // });
  }, []);

  return null;
}

export default App;

/* 

<Blink times="5"></Blink>
<Pause duration="20"/>
<Highlight></Highlight>

need an escape sequence to actually write these things
^^<Highlight></Highlight>
should literally write "<Highlight></Highlight>" to the display

What about

<Highlight>
  <Blink times="5">
    text 
  </Blink>
</Highlight>

Or: 

<Blink times="5">
  <Highlight>
    text 
  </Highlight>
</Blink>
*/

/* 
will need to digest the input text in some other fashion
- rather than splitting on certain characters
we may need to ingest a little bit at a time if we want to handle nesting?

we could use a simpler solution that just looks for a flag at the begining of each word
 */
