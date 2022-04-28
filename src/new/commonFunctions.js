const { drawScrollWords } = require('./asyncDrawingFunctions.js');
const { drawScrollWordsSync } = require('./syncDrawingFunctions.js');

function breakWord(word, columns, broken = []) {
  // recursively break down a word that is too long
  if (word.length <= columns) {
    return [...broken, word];
  } else {
    return [
      ...broken,
      word.slice(0, columns),
      ...breakWord(word.slice(columns, word.length), columns, broken),
    ];
  }
}

function parseWords(text, columns) {
  return text.split(/(\s|\n)/).reduce((acc, w) => {
    const { flags, trimmed } = getFlags(w);
    if (!trimmed.length) return acc;
    const totalSegments = Math.ceil(trimmed.length / columns);
    const segments =
      totalSegments > 1 ? breakWord(trimmed, columns) : [trimmed];
    return [...acc, { fullWordText: trimmed, totalSegments, segments, flags }];
  }, []);
}

function getFlags(fullWordText) {
  // just detect flags at the beginning of each word
  const highlightFlag = /^<HL>/.test(fullWordText);
  const trimmed = highlightFlag ? fullWordText.slice(4) : fullWordText;
  return { flags: { highlightFlag }, trimmed };
}

function makeWords(text, columns, defs) {
  // break the string into words, none of which are longer than the number of columns
  const parsedWords = parseWords(text, columns);

  // assign each word a row and column value
  return parsedWords.reduce(
    (acc, word) => {
      word.segments.forEach((segment, segmentIndex) => {
        if (/[\n\s]/.test(segment)) {
          if (segment === '\n') {
            acc.row += 1;
            acc.col = 0;
          }
          return acc;
        }

        if (acc.getRemaining() >= segment.length) {
          acc.words.push({
            word,
            segment,
            segmentIndex,
            row: acc.row,
            col: acc.col,
            chars: makeChars({
              segment,
              segmentIndex,
              word,
              row: acc.row,
              col: acc.col,
              defs,
            }),
          });
          acc.col += segment.length + 1;
          // +1 is to add a space
        } else {
          acc.row += 1;
          acc.col = 0;
          acc.words.push({
            word,
            segment,
            segmentIndex,
            row: acc.row,
            col: acc.col,
            chars: makeChars({
              segment,
              segmentIndex,
              word,
              row: acc.row,
              col: acc.col,
              defs,
            }),
          });
          acc.col += segment.length + 1;
        }
      });
      return acc;
    },
    {
      words: [],
      getRemaining() {
        return columns - this.col;
      },
      row: 0,
      col: 0,
    },
  );
}

function makeChars({ segment, segmentIndex, word, row, col, defs }) {
  return segment.split('').map((c, i) => {
    let frameNum = 0;
    return {
      char: c,
      row,
      col: col + i,
      def: defs[c] ?? defs[' '],
      charWidth: defs.charWidth,
      flags: word.flags,
      segmentIndex,
      index() {
        // provide a the index to the segment on the associated word
        return segmentIndex();
      },
      word() {
        // provide a reference to the associated word
        return word;
      },
      frameNum() {
        return frameNum;
      },
      frameState() {
        return getFrameState(frameNum, this);
      },
      nextFrame() {
        if (frameNum < defs.charWidth) {
          const frame = getFrameState(frameNum, this);
          frameNum += 1;
          return frame;
        } else if (frameNum === defs.charWidth) {
          frameNum = 0;
          return getFrameState(frameNum, this);
        }
      },
      setFrameNum(val) {
        frameNum = val;
      },
      applyScrollTransform(scrollFrameIndex, state) {
        // every Y value in every char should be decremented by charWidth
        // thereby moving that point up one display grid unit (not column)
        return applyScrollTransformToDef({
          scrollFrameIndex,
          charObj: this,
          state,
        });
      },
    };
  });
}

// this works on the def array - what if we wrote a function that works on x,y points
function applyHighlightTransform(def, charObj) {
  if (!charObj.flags.highlightFlag) return def;
  const { charWidth } = charObj;
  let full = [];
  for (let i = -charWidth; i < (charWidth + 1) * charWidth; i++) {
    if (!def.includes(i)) full.push(i);
  }

  // we should see col values of -1 and 7
  full.forEach(index =>
    console.log(gridPositionFromIndex({ index, columns: charWidth + 1 })),
  );

  return full;
}

function applyScrollTransformToDef({ scrollFrameIndex, charObj, state }) {
  const { gridSpaceY, scale } = state.config;
  const newDef = applyHighlightTransform(charObj.def, charObj).map(point => {
    const scrolledPoint =
      point - charObj.charWidth * (scrollFrameIndex + (gridSpaceY / scale - 1));
    return gridPositionFromIndex({
      index: scrolledPoint,
      columns: charObj.charWidth,
      char: charObj.char,
    });
  });
  return newDef;
}

function gridPositionFromIndex({ index, columns, char }) {
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

function getFrameState(frameNum, charObj) {
  // based one the frame num, apply a transformation to the def
  // and return it as a new array
  // this will be what gets drawn to the canvas for that character frame
  const { charWidth, def } = charObj;
  const lastFrame = charWidth === frameNum + 1;

  const totalPoints = charWidth * (frameNum + 1);

  return applyHighlightTransform(def.slice(0, totalPoints), charObj).reduce(
    (acc, point) => {
      const newPoint = gridPositionFromIndex({
        index: point,
        columns: frameNum + 1,
      });

      if (lastFrame) {
        if (newPoint.row < charWidth + 1 && newPoint.row > -2) {
          acc.push(newPoint);
        }
      }
      if (newPoint.row < charWidth && newPoint.row > -2) {
        acc.push(newPoint);
      }

      return acc;
    },
    [],
  );
}

function makeStateAsync({ words, ctx, config }) {
  let color = 'rgb(0,0,0)';
  let rowsScrolled = 0;
  const state = {
    ctx,
    words,
    config,
    color,
    rowsScrolled() {
      return rowsScrolled;
    },
    async scroll({ charObj }) {
      // grab all the words with rows < charObj.row
      // we'll need to re-draw these
      const scrollTheseWords = words.filter(word => word.row < charObj.row);
      await drawScrollWords({ state: { ...this, words: scrollTheseWords } });
      rowsScrolled += 1;
    },
  };

  return state;
}

function makeStateSync({ words, ctx, config }) {
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
      const scrollTheseWords = words.filter(word => word.row < charObj.row);
      drawScrollWordsSync({ state: { ...this, words: scrollTheseWords } });
      rowsScrolled += 1;
    },
  };

  return state;
}

function setupCanvas({
  canvas,
  totalRows,
  columns,
  scale,
  charWidth,
  gridSpaceX,
  gridSpaceY,
  displayRows,
}) {
  // set up the canvas
  if (canvas === null || canvas === undefined) {
    throw new Error("couldn't get canvas element");
  }
  const ctx = canvas.getContext('2d');
  // we need to alot for space between rows and columns when sizing the canvas
  // we'll draw a border around the canvas elsehwere
  // so also include space for this
  const borderThickness = scale * 3;
  const borderSpace = borderThickness * 2;
  const borderStroke = scale;

  ctx.canvas.width =
    columns * scale * charWidth + (columns - 1) * gridSpaceX + borderSpace;
  ctx.canvas.height =
    displayRows * scale * charWidth +
    (displayRows - 1) * gridSpaceY +
    borderSpace;

  return {
    ctx,
    config: {
      totalRows,
      columns,
      displayRows,
      scale,
      charWidth,
      gridSpaceX,
      gridSpaceY,
      borderThickness,
      borderSpace,
      borderStroke,
    },
  };
}

function makeCanvas() {
  const root = document.getElementById('root');
  const canvas = document.createElement('canvas');
  canvas.style.margin = '3px';
  root.appendChild(canvas);
  return canvas;
}

function drawBorder({ ctx, state }) {
  const borderStroke = state.config.borderStroke;
  ctx.strokeStyle = state.color;

  ctx.moveTo(borderStroke / 2, borderStroke / 2);
  ctx.lineTo(ctx.canvas.width - borderStroke / 2, borderStroke / 2);
  ctx.lineTo(
    ctx.canvas.width - borderStroke / 2,
    ctx.canvas.height - borderStroke / 2,
  );
  ctx.lineTo(borderStroke / 2, ctx.canvas.height - borderStroke / 2);
  ctx.lineTo(borderStroke / 2, 0);
  ctx.lineWidth = borderStroke;
  ctx.stroke();
}

module.exports = {
  makeCanvas,
  setupCanvas,
  makeStateAsync,
  makeStateSync,
  makeWords,
  makeChars,
  gridPositionFromIndex,
  applyScrollTransformToDef,
  drawBorder,
};
