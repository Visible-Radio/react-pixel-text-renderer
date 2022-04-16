export async function asyncDrawWords({ state }) {
  const { words } = state;
  return new Promise(async (resolve) => {
    for (let word of words) {
      await drawWord({ word, state });
    }
    resolve(undefined);
  });
}

async function drawWord({ word, state }) {
  return new Promise(async (resolve) => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, state });
    }
    resolve(undefined);
  });
}

async function drawEachCharFrame({ charObj, state }) {
  const { config } = state;
  return new Promise(async (resolve) => {
    if (charObj.row === config.displayRows + state.rowsScrolled()) {
      //
      await state.scroll({ charObj });
    }
    let last;
    while (charObj.frameNum() < config.charWidth) {
      const pixels = charObj.nextFrame();
      if (last) {
        //
        clearFrame({ pixels: last, charObj, state });
      }
      await drawFrame({ pixels, charObj, state });
      last = pixels;
    }
    resolve(undefined);
  });
}

function drawFrame({ pixels, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth },
    rowsScrolled,
  } = state;
  return new Promise((resolve) => {
    pixels.forEach(({ row: pxRow, col: pxCol }) => {
      const rowGap = (charObj.row - rowsScrolled()) * scale;
      const colGap = charObj.col * scale;
      const pxX = charObj.col * scale * charWidth + pxCol * scale + colGap;
      const pxY =
        (charObj.row - rowsScrolled()) * scale * charWidth +
        pxRow * scale +
        rowGap;
      const pxSizeX = scale;
      const pxSizeY = scale;

      ctx.fillStyle = "rgb(255,0,190)";
      ctx.fillRect(pxX, pxY, pxSizeX, pxSizeY);
    });
    setTimeout(() => resolve(undefined), 20);
  });
}

function clearFrame({ pixels, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth },
    rowsScrolled,
  } = state;
  pixels.forEach(({ row: pxRow, col: pxCol }) => {
    const rowGap = (charObj.row - rowsScrolled()) * scale;
    const colGap = charObj.col * scale;
    ctx.clearRect(
      charObj.col * scale * charWidth + pxCol * scale + colGap,
      (charObj.row - rowsScrolled()) * scale * charWidth +
        pxRow * scale +
        rowGap,
      scale,
      scale
    );
  });
}
