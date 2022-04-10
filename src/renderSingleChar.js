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

function makeChar({ char, index, gridWidth }) {
  return {
    char,
    x: null,
    y: null,
    row: null,
    col: null,
    frame: null,
  };
}

function makeGrid({ width, heigth, scale, text }) {
  // based on the given charWidth, width and pixel scale, determine how many rows and columns are needed
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
  const { words } = makeWords(text, columns);
  const rows = words.slice(-1)[0].row + 1;
  const { canvas, ctx } = setup({
    canvasRef,
    rows,
    columns,
    scale,
    charWidth,
    gridSpace: scale,
  });
  console.log(canvas.width);

  console.log({ columns });
}

function makeWords(text, columns) {
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
  const col = index % (row * columns);
  return {
    col,
    row,
  };
}

export default async function renderSingleChar({
  width,
  pixelScale,
  canvasRef,
  inputChar,
  color,
  wordWrap = false,
  customDefs,
}) {
  // import custom defs if supplied or use the bundled ones
  const characterMaps = customDefs;
  const { charWidth } = characterMaps;

  let currentPermittedWidth = 0;
  let textPixels = [];
  const horizontalChars = parseInt(width / (charWidth + 1) + 1, 10);
  const { starts, words, wastedCharSpaces } = getWordStarts(inputChar);

  // calculate how many rows needed for the given input text if we're using charWrap or wordWrap
  const rows = Math.ceil(
    (inputChar.length + (() => (wordWrap ? wastedCharSpaces : 0))()) /
      horizontalChars
  );
  // calculate pixel grid height based on input text
  const height = rows * charWidth + (rows - 1);

  // set up the canvas
  const { canvas, ctx } = setup({
    canvasRef,
    height,
    width,
    scale: pixelScale,
  });

  writeString(inputChar, textPixels);
  await animatedDraw();

  async function animatedDraw() {
    return new Promise((resolve) => {
      const timerId = setInterval(() => {
        if (currentPermittedWidth >= width) {
          clearInterval(timerId);
          draw(width, textPixels, ctx, pixelScale);
          resolve("animation done");
        } else {
          currentPermittedWidth += 1;
          draw(currentPermittedWidth, textPixels, ctx, pixelScale);
        }
      }, 50);
    });
  }

  function getWordStarts(inputChar) {
    let startPosition = 0;
    let remaining = horizontalChars;
    let wastedCharSpaces = 0;
    const words = inputChar.toUpperCase().split(" ");

    // create an array with the position of the start of each word
    const starts = [];

    for (let i = 0; i < words.length; i++) {
      if (remaining >= words[i].length) {
        starts.push(startPosition);
        startPosition += words[i].length * (charWidth + 1) + (charWidth + 1);
        remaining -= words[i].length + 1;
      } else {
        wastedCharSpaces += remaining;
        // jump to new line
        startPosition +=
          (width + 1) * charWidth + (remaining - 1) * (charWidth + 1);
        starts.push(startPosition);
        startPosition += words[i].length * (charWidth + 1) + (charWidth + 1);
        remaining = horizontalChars;
        remaining -= words[i].length + 1;
      }
    }
    return {
      starts,
      words,
      wastedCharSpaces,
    };
  }

  function writeWords() {
    let charPosition = 0;
    let channels;
    starts.forEach((startPosition, i) => {
      charPosition = 0;
      Array.from(words[i]).forEach((char) => {
        if (characterMaps.hasOwnProperty(char)) {
          if (!color) {
            // channels = generateRandomColors()
            channels = generatePalette();
          } else {
            channels = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
          }
          writeChar(char, textPixels, startPosition + charPosition, channels);
        } else {
          writeChar(" ", textPixels, startPosition + charPosition);
        }
        charPosition += charWidth + 1;
      });
    });
  }

  function writeString(inputChar, textPixels) {
    let remaining = horizontalChars;
    let position = 0;
    let char;
    let channels;
    for (let i = 0; i < inputChar.length; i++) {
      char = `${inputChar[i].toUpperCase()}`;

      if (characterMaps.hasOwnProperty(char)) {
        if (!color) {
          channels = generatePalette();
        } else {
          channels = generatePalette({ originColor: color });
        }
        writeChar(char, textPixels, position, channels);
      } else {
        writeChar(" ", textPixels, position, channels);
      }
      remaining--;
      if (remaining === 0) {
        remaining = horizontalChars;
        position += (width + 1) * charWidth;
      } else {
        position += charWidth + 1;
      }
    }
  }

  function writeChar(char, textPixels, position, channels) {
    const randomNum = Math.random();
    const palette = characterMaps[char.toUpperCase()]
      .map((point) => generatePalette({ channelDeviationLimit: 100 }))
      .sort(
        (a, b) =>
          a.reduce((acc, elem) => acc + elem, 0) -
          b.reduce((acc, elem) => acc + elem, 0)
      );

    const arrToRGBString = (channels) => {
      return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
    };

    characterMaps[char.toUpperCase()].forEach((charPixel, i) => {
      const charRow = Math.floor(charPixel / charWidth);
      const offset = charPixel % charWidth;
      textPixels[charRow * width + offset + position] =
        randomNum < 0.85
          ? arrToRGBString(channels)
          : arrToRGBString(palette[i]);
    });
  }

  function draw(permittedWidth, textPixels, ctx, pixelScale) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw	a frame at a given permitted width
    const pixelsToDraw = height * permittedWidth - 1;

    outer: for (let column = 0; column < height; column++) {
      for (let row = 0; row < permittedWidth; row++) {
        // which pixel do I select from textPixels based on column and row?
        let pixelIndex = row + column * permittedWidth;
        if (pixelIndex > pixelsToDraw) break outer;
        if (textPixels[pixelIndex] !== undefined) {
          ctx.fillStyle = textPixels[pixelIndex];
          ctx.fillRect(
            row * pixelScale,
            column * pixelScale,
            pixelScale,
            pixelScale
          );
        }
      }
    }
  }
}

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
