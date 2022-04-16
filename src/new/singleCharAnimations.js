/* TODO add an arg for sync / async - ie, if drawing in browser, we want to see the animation
If drawing in node, we don't want to waste time displaying each frame
Instead we want to generate each as quickly as possible to pass to the gif encoder 
in this mode, we may need the top level interface to also accept a callback to be called
each time a frame has been drawn, so it can be captured from the canvas*/

export function _textRenderer({ columns, scale, canvasRef, text, defs }) {
  const { charWidth } = defs;
  const { words } = makeWords(text, columns, defs);
  const rows = words.slice(-1)[0].row + 1;
  const ctx = setupCanvas({
    canvasRef,
    rows,
    columns,
    scale,
    charWidth,
    gridSpace: scale,
  });

  drawWords({ words, ctx, charWidth, scale });
}

function makeWords(text, columns, defs) {
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

function makeChars({ word, row, col, defs }) {
  return word.split("").map((c, i) => {
    let frameNum = 0;
    return {
      char: c,
      row,
      col: col + i,
      x: null,
      y: null,
      def: defs[c],
      charWidth: defs.charWidth,
      frameNum: function () {
        return frameNum;
      },
      frameState: function () {
        return getFrameState(frameNum, this.def, this.charWidth);
      },
      nextFrame: function () {
        if (frameNum < defs.charWidth) {
          const frame = getFrameState(frameNum, this.def, this.charWidth);
          frameNum += 1;
          return frame;
        } else if (frameNum === defs.charWidth) {
          frameNum = 0;
          return getFrameState(frameNum, this.def, this.charWidth);
        }
      },
    };
  });
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

function gridPositionFromIndex({ index, columns }) {
  const row = Math.floor(index / columns);
  const col = row === 0 ? index % (row + 1 * columns) : index % (row * columns);
  return {
    col,
    row,
  };
}

function setupCanvas({
  canvasRef,
  rows,
  columns,
  scale,
  charWidth,
  gridSpace,
}) {
  // set up the canvas
  // we need to alot for space between rows and columns when sizing the canvas
  const canvas = canvasRef.current;
  if (canvas === null || canvas === undefined) {
    throw new Error("couldn't get canvas element");
  }
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = columns * scale * charWidth + (columns - 1) * gridSpace;
  ctx.canvas.height = rows * scale * charWidth + (rows - 1) * gridSpace;

  return ctx;
}

async function drawWords({ words, ctx, charWidth, scale }) {
  return new Promise(async (resolve) => {
    for (let word of words) {
      await drawWord({ word, ctx, charWidth, scale });
    }
  });
}

async function drawWord({ word, ctx, charWidth, scale }) {
  return new Promise(async (resolve) => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, ctx, charWidth, scale });
    }
    resolve(undefined);
  });
}

async function drawEachCharFrame({ charObj, ctx, charWidth, scale }) {
  return new Promise(async (resolve) => {
    let last;
    while (charObj.frameNum() < charWidth) {
      const pixels = charObj.nextFrame();
      if (last) {
        //
        clearFrame({ pixels: last, charObj, ctx, charWidth, scale });
      }
      await drawFrame({ pixels, charObj, ctx, charWidth, scale });
      last = pixels;
    }
    resolve(undefined);
  });
}

function drawFrame({ pixels, charObj, ctx, charWidth, scale }) {
  return new Promise((resolve) => {
    pixels.forEach(({ row: pxRow, col: pxCol }) => {
      const rowGap = charObj.row * scale;
      const colGap = charObj.col * scale;
      ctx.fillStyle = "rgb(255,0,190)";
      ctx.fillRect(
        charObj.col * scale * charWidth + pxCol * scale + colGap,
        charObj.row * scale * charWidth + pxRow * scale + rowGap,
        scale,
        scale
      );
    });
    setTimeout(() => resolve(undefined), 20);
  });
}

function clearFrame({ pixels, charObj, ctx, charWidth, scale }) {
  pixels.forEach(({ row: pxRow, col: pxCol }) => {
    const rowGap = charObj.row * scale;
    const colGap = charObj.col * scale;
    ctx.clearRect(
      charObj.col * scale * charWidth + pxCol * scale + colGap,
      charObj.row * scale * charWidth + pxRow * scale + rowGap,
      scale,
      scale
    );
  });
}
