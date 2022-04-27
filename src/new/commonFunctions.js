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
    if (!w.length) return acc;

    const totalSegments = Math.ceil(w.length / columns);
    const segments = totalSegments > 1 ? breakWord(w, columns) : [w];
    return [...acc, { fullWordText: w, totalSegments, segments }];
  }, []);
}

function makeWords(text, columns, defs) {
  // break the string into words, none of which are longer than the number of columns
  const parsedWords = parseWords(text, columns);
  // console.log(parsedWords);

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

function applyScrollTransformToDef({ scrollFrameIndex, charObj, state }) {
  const { gridSpaceY, scale } = state.config;
  const newDef = charObj.def.map(point => {
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

function makeStateAsync({ words, ctx, config }) {
  let color = 'rgb(255,0,190)';
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
