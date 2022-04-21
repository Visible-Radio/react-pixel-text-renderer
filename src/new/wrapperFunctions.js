import { asyncDrawWords } from './asyncDrawingFunctions.js';
import {
  makeCanvas,
  makeStateAsync,
  makeStateSync,
  makeWords,
  setupCanvas,
} from './commonFunctions.js';
import { syncDrawWords } from './syncDrawingFunctions.js';

// For use in the browser
export function asyncTextRenderer({ columns, scale, text, defs, displayRows }) {
  const { charWidth } = defs;
  const { words } = makeWords(text, columns, defs);
  const totalRows = words.slice(-1)[0].row + 1;
  const { ctx, config } = setupCanvas({
    canvas: makeCanvas(),
    totalRows,
    columns,
    scale,
    charWidth,
    // need gridSpaceX and gridSpaceY
    gridSpace: scale * 3, // gridSpace should always be a multiple of scale
    displayRows,
  });
  const state = makeStateAsync({ ctx, words, config });
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
      displayRows,
    });
    newFrameCanvas.drawImage(ctx.canvas, 0, 0);
  };

  syncDrawWords({
    state,
  });
}
