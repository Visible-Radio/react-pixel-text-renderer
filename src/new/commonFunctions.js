import { drawScrollWords } from "./asyncDrawingFunctions";
import { drawScrollWordsSync } from "./syncDrawingFunctions";

export function makeWords(text, columns, defs) {
  // each word in the resulting array will have a row and column value
  const words = text.split(" ");
  return words.reduce(
    (acc, word) => {
      // need to add handling for words that are longer than the column is wide
      if (acc.remaining >= word.length) {
        acc.words.push({
          word,
          row: acc.row,
          col: acc.col,
          chars: makeChars({ word, row: acc.row, col: acc.col, defs }),
        });
        acc.remaining -= word.length + 1;
        acc.col += word.length + 1;
      } else {
        // start a new line
        acc.row += 1;
        acc.col = 0;
        acc.words.push({
          word,
          row: acc.row,
          col: acc.col,
          chars: makeChars({ word, row: acc.row, col: acc.col, defs }),
        });
        acc.remaining = columns - (word.length + 1);
        acc.col += word.length + 1;
      }
      return acc;
    },
    {
      words: [],
      remaining: columns,
      row: 0,
      col: 0,
    }
  );
}

export function makeChars({ word, row, col, defs }) {
  return word.split("").map((c, i) => {
    let frameNum = 0;
    return {
      char: c,
      row,
      col: col + i,
      def: defs[c],
      charWidth: defs.charWidth,
      word() {
        // provide a reference to the associated word
        return word;
      },
      frameNum() {
        return frameNum;
      },
      frameState() {
        return getFrameState(frameNum, this.def, this.charWidth);
      },
      nextFrame() {
        if (frameNum < defs.charWidth) {
          const frame = getFrameState(frameNum, this.def, this.charWidth);
          frameNum += 1;
          return frame;
        } else if (frameNum === defs.charWidth) {
          frameNum = 0;
          return getFrameState(frameNum, this.def, this.charWidth);
        }
      },
      lastFrame() {
        getFrameState(this.charWidth - 1, this.def, this.charWidth);
      },
      setFrameNum(val) {
        frameNum = val;
      },
      applyScrollTransform(scrollFrameIndex) {
        // every Y value in every char should be decremented by charWidth
        // thereby moving that point up one display grid unit (not column)
        const newDef = this.def.map((point) => {
          const scrolledPoint = point - this.charWidth * scrollFrameIndex;
          return gridPositionFromIndex({
            index: scrolledPoint,
            columns: this.charWidth,
            char: this.char,
          });
        });

        return newDef;
      },
    };
  });
}

export function gridPositionFromIndex({ index, columns, char }) {
  if (index >= 0) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return {
      col,
      row,
    };
  }

  if (index < 0) {
    const row = Math.floor(index / columns);
    const col =
      index % columns === 0 ? index % columns : (index % columns) + columns;
    return {
      col,
      row,
    };
  }
}

function getFrameState(frameNum, def, charWidth) {
  // based one the frame num, apply a transformation to the def
  // and return it as a new array
  // this will be what gets drawn to the canvas for that character frame
  const totalPoints = charWidth * (frameNum + 1);

  return def.slice(0, totalPoints).reduce((acc, point) => {
    const newPoint = gridPositionFromIndex({
      index: point,
      columns: frameNum + 1,
    });
    if (newPoint.row < charWidth) {
      acc.push(newPoint);
    }
    return acc;
  }, []);
}

export function makeStateAsync({ words, ctx, config }) {
  let rowsScrolled = 0;
  const state = {
    ctx,
    words,
    config,
    rowsScrolled() {
      return rowsScrolled;
    },
    async scroll({ charObj }) {
      // grab all the words with rows < charObj.row
      // we'll need to re-draw these
      const scrollTheseWords = words.filter((word) => word.row < charObj.row);
      await drawScrollWords({ state: { ...this, words: scrollTheseWords } });
      rowsScrolled += 1;
    },
  };

  return state;
}

export function makeStateSync({ words, ctx, config }) {
  let rowsScrolled = 0;
  const state = {
    ctx,
    words,
    config,
    rowsScrolled() {
      return rowsScrolled;
    },
    scroll({ charObj }) {
      // grab all the words with rows < charObj.row
      // we'll need to re-draw these
      const scrollTheseWords = words.filter((word) => word.row < charObj.row);
      drawScrollWordsSync({ state: { ...this, words: scrollTheseWords } });
      rowsScrolled += 1;
    },
  };

  return state;
}

export function setupCanvas({
  canvas,
  totalRows,
  columns,
  scale,
  charWidth,
  gridSpace,
  displayRows,
}) {
  // set up the canvas
  // we need to alot for space between rows and columns when sizing the canvas
  if (canvas === null || canvas === undefined) {
    throw new Error("couldn't get canvas element");
  }
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = columns * scale * charWidth + (columns - 1) * gridSpace;
  ctx.canvas.height =
    displayRows * scale * charWidth + (displayRows - 1) * gridSpace;

  return {
    ctx,
    config: {
      totalRows,
      columns,
      displayRows,
      scale,
      charWidth,
      gridSpace,
    },
  };
}

export function makeCanvas() {
  const root = document.getElementById("root");
  const canvas = document.createElement("canvas");
  root.appendChild(canvas);
  return canvas;
}
