// import { defs } from "./customDefs_charWidth_7.json";

function setup({ canvasRef, rows, columns, scale, charWidth, gridSpace }) {
  // set up the canvas
  // we need to alot for space between rows and columns when sizing the canvas
  const canvas = canvasRef.current;
  if (canvas === null || canvas === undefined) {
    throw new Error("couldn't get canvas element");
  }
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = columns * scale * charWidth + (columns - 1) * gridSpace;
  ctx.canvas.height = rows * scale * charWidth + (rows - 1) * gridSpace;

  return { canvas, ctx };
}

async function drawEachCharFrame({ charObj, ctx, canvas, charWidth, scale }) {
  return new Promise(async (resolve) => {
    console.log(charObj);
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
      ctx.fillStyle = "rgb(255,0,190)";
      ctx.fillRect(
        charObj.col * scale * charWidth + pxCol * scale,
        charObj.row * scale * charWidth + pxRow * scale + charObj.row * scale,
        scale,
        scale
      );
    });
    setTimeout(() => resolve(undefined), 20);
  });
}

function clearFrame({ pixels, charObj, ctx, charWidth, scale }) {
  pixels.forEach(({ row: pxRow, col: pxCol }) => {
    ctx.clearRect(
      charObj.col * scale * charWidth + pxCol * scale,
      charObj.row * scale * charWidth + pxRow * scale + charObj.row * scale,
      scale,
      scale
    );
  });
}

async function drawWord({ word, ctx, canvas, charWidth, scale }) {
  return new Promise(async (resolve) => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, ctx, canvas, charWidth, scale });
    }
    resolve(undefined);
  });
}

async function drawWords({ words, ctx, canvas, charWidth, scale }) {
  return new Promise(async (resolve) => {
    for (let word of words) {
      await drawWord({ word, ctx, canvas, charWidth, scale });
    }
  });
}

export function textRenderer({
  gridWidth,
  height,
  scale,
  canvasRef,
  text,
  color,
  defs,
}) {
  const { charWidth } = defs;
  const columns = Math.floor(gridWidth / charWidth);
  const { words } = makeWords(text, columns, defs);
  const rows = words.slice(-1)[0].row + 1;
  const { canvas, ctx } = setup({
    canvasRef,
    rows,
    columns,
    scale,
    charWidth,
    gridSpace: scale,
  });

  drawWords({ words, ctx, canvas, charWidth, scale });
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

function gridPositionFromIndex({ index, columns }) {
  const row = Math.floor(index / columns);
  const col = row === 0 ? index % (row + 1 * columns) : index % (row * columns);
  return {
    col,
    row,
  };
}

window.gridPositionFromIndex = gridPositionFromIndex;

function generateRandomColors() {
  const random = () => {
    const num = Math.floor(Math.random() * (350 - 50) + 50);
    return num > 255 ? 255 : num;
  };
  const R = random();
  const G = random();
  const B = random();
  const color = `rgb(${R}, ${G}, ${B})`;
  return color;
}

function generatePalette(customOptions) {
  const options = {
    channelDeviationLimit: 130,
    originColor: [205, 0, 190],
    channelMax: 255,
    channelMin: 10,
    ...customOptions,
  };
  // upperLimit and lowerLimit limit the absolute values of a channel
  const { channelDeviationLimit, originColor, channelMax, channelMin } =
    options;
  const random = () => {
    const polarity = Math.random() > 0.5 ? -1 : 1;
    return Math.floor(Math.random() * channelDeviationLimit) * polarity;
  };
  const [Ror, Gor, Bor] = originColor;
  const mod = random();

  const getAdjustedChannel = (channelVal, modVal) => {
    if (channelVal + modVal < channelMin) return channelMin;
    if (channelVal + modVal > channelMax) return channelMax;
    return channelVal + modVal;
  };

  const R = getAdjustedChannel(Ror, mod);
  const G = getAdjustedChannel(Gor, mod);
  const B = getAdjustedChannel(Bor, mod);

  return [R, G, B];
}
