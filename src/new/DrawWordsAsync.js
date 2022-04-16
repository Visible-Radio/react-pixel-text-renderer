export async function asyncDrawWords({ words, ctx, config }) {
  return new Promise(async (resolve) => {
    for (let word of words) {
      await drawWord({ word, ctx, config });
    }
    resolve(undefined);
  });
}

async function drawWord({ word, ctx, config }) {
  return new Promise(async (resolve) => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, ctx, config });
    }
    resolve(undefined);
  });
}

async function drawEachCharFrame({ charObj, ctx, config }) {
  return new Promise(async (resolve) => {
    if (charObj.row === config.displayRows + config.rowsScrolled()) {
      //
      await config.scroll();
    }

    let last;
    while (charObj.frameNum() < config.charWidth) {
      const pixels = charObj.nextFrame();
      if (last) {
        //
        clearFrame({ pixels: last, charObj, ctx, config });
      }
      await drawFrame({ pixels, charObj, ctx, config });
      last = pixels;
    }
    resolve(undefined);
  });
}

function drawFrame({ pixels, charObj, ctx, config }) {
  const { scale, charWidth, rowsScrolled } = config;
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

function clearFrame({ pixels, charObj, ctx, config }) {
  const { scale, charWidth, rowsScrolled } = config;
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
