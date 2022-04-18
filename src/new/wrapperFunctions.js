import { asyncDrawWords } from "./asyncDrawingFunctions";
import {
  makeCanvas,
  makeStateAsync,
  makeStateSync,
  makeWords,
  setupCanvas,
} from "./commonFunctions";
import { syncDrawWords } from "./syncDrawingFunctions";

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
    gridSpace: scale,
    displayRows,
  });
  const state = makeStateAsync({ ctx, words, config });
  asyncDrawWords({ state });
}

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
    console.log("frame done");
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

/* 
destCtx.drawImage(sourceCanvas, 0, 0);
*/
