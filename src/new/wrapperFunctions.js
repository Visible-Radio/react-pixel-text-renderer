import { asyncDrawWords } from './asyncDrawingFunctions.js';
import {
  drawBorder,
  makeCanvas,
  makeStateAsync,
  makeStateSync,
  makeWords,
  modifyDefs,
  setupCanvas,
} from './commonFunctions.js';
import { syncDrawWords } from './syncDrawingFunctions.js';

// For use in the browser
export function asyncTextRenderer({ columns, scale, text, defs, displayRows }) {
  const modifiedDefs = modifyDefs(defs);
  const { charWidth } = modifiedDefs;
  const { words } = makeWords(text, columns, modifiedDefs);

  const totalRows = words.slice(-1)[0].row + 1;
  const { ctx, config } = setupCanvas({
    canvas: makeCanvas(),
    totalRows,
    columns,
    scale,
    charWidth,
    gridSpaceX: 0,
    gridSpaceY: scale,
    displayRows,
  });
  const state = makeStateAsync({ ctx, words, config });
  console.log(words);
  drawBorder(state);
  asyncDrawWords({ state });
}

// For Debugging in the browser - Creates a canvas for each frame and appends it to the DOM
export function syncTextRenderer({ columns, scale, text, defs, displayRows }) {
  const { charWidth } = defs;
  const { words } = makeWords(text, columns, defs);
  const totalRows = words.slice(-1)[0].row + 1;
  const { ctx, config } = setupCanvas({
    canvas: makeCanvas(),
    totalRows,
    columns,
    scale,
    charWidth,
    gridSpace: scale,
    gridSpaceX: 3,
    gridSpaceY: 3,
    displayRows,
  });
  const state = makeStateSync({ ctx, words, config });

  state.config.snapshot = () => {
    const { ctx: newFrameCanvas } = setupCanvas({
      canvas: makeCanvas(),
      totalRows,
      columns,
      scale,
      charWidth,
      gridSpace: scale,
      gridSpaceX: 3,
      gridSpaceY: 3,
      displayRows,
    });
    newFrameCanvas.drawImage(ctx.canvas, 0, 0);
  };

  syncDrawWords({
    state,
  });
}
