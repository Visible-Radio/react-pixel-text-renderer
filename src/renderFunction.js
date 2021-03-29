// old bundled defs
import { charDefinitions } from './definitions2';

export default function renderText(width, pixelScale, canvasRef, inputText, color, animate=false, wordWrap = false, customDefs) {

	// calculate the closest appropriate width based on the input width
	const remainder = width % 6;
	if (remainder === 0) {
		width = width - 1;

	}	else if (remainder !== 0) {
		width = width - remainder -1
	}
  if (width < 5) {
		console.log("width must be at least 6");
		return;
	}

	let currentPermittedWidth = 0;
	let textPixels = [];
	// import custom defs if supplied or use the bundled ones
	const characterMaps =  customDefs || charDefinitions();
	const  { charWidth } = characterMaps;
	const horizontalChars = parseInt(width/(6)+1,10);
	const { starts, words, wastedCharSpaces } = getWordStarts(inputText);

	// calculate how many rows needed for the given input text if we're using charWrap or wordWrap
	const rows = Math.ceil((inputText.length + (() => wordWrap ? wastedCharSpaces : 0)()) / horizontalChars);
	// calculate pixel grid height based on input text
	const height = (rows * 5) + (rows - 1);

 	// set up the canvas
	const canvas = canvasRef.current
	if (canvas === null || canvas === undefined) {
		console.log("couldn't get canvas element")
		return;
	}
	const ctx = canvas.getContext('2d');
	ctx.canvas.width = width * pixelScale;
	ctx.canvas.height = height * pixelScale;

	wordWrap ? writeWords() : writeString(inputText, textPixels);
  animate ? animatedDraw() : draw(width, textPixels, ctx, pixelScale);

	function animatedDraw() {
		const timerId = setInterval(() => {
			if (currentPermittedWidth >= width) {
				clearInterval(timerId);
				draw(width, textPixels, ctx, pixelScale);
			} else {
				currentPermittedWidth +=1;
				draw(currentPermittedWidth, textPixels, ctx, pixelScale);
			}
		},20)
	}

	function getWordStarts(inputText) {
		let startPosition = 0;
		let remaining = horizontalChars;
		let wastedCharSpaces = 0;
		const words = inputText.toUpperCase().split(' ');

		// create an array with the position of the start of each word
		const starts = [];

		for (let i = 0; i < words.length; i++) {
			if (remaining >= words[i].length) {
				starts.push(startPosition);
				startPosition += (words[i].length * 6) + 6
				remaining -= words[i].length + 1;
			} else {
				wastedCharSpaces += remaining;
				// jump to new line
				startPosition += ((width + 1) * 5) + (remaining - 1) * 6;
				starts.push(startPosition);
				startPosition += (words[i].length * 6) + 6;
				remaining = horizontalChars;
				remaining -= words[i].length + 1;
			}
		}
		return {
			starts,
			words,
			wastedCharSpaces,
		}
	}

	function writeWords() {
		let charPosition = 0;
		let channels;
		starts.forEach((startPosition, i) => {
			charPosition = 0;
			Array.from(words[i]).forEach(char => {
				if (characterMaps.hasOwnProperty(char)) {
					if (!color) {
						channels = generateRandomColors()
					} else {
						channels = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
					}
					writeChar(char, textPixels, startPosition + charPosition, channels);
				} else {
					writeChar(" ", textPixels, startPosition + charPosition);
				}
				charPosition += 6;
			})
		});
	}

	function writeString(inputText, textPixels) {
		let remaining = horizontalChars;
		let position = 0;
		let char;
		let channels;
		for (let i = 0; i < inputText.length; i++) {
			char = `${inputText[i].toUpperCase()}`;

			if (characterMaps.hasOwnProperty(char)) {
				if (!color) {
					channels = generateRandomColors()
				} else {
					channels = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
				}
				writeChar(char, textPixels, position, channels);
			} else {
				writeChar(" ", textPixels, position);
			}
			remaining--;
			if (remaining === 0) {
				remaining = horizontalChars;
				position += (width + 1) * 5;
			} else {
				position += 6;
			}
		}
	}

	function writeChar(char, textPixels, position, color) {
		// for defs that include expresions relative to width, like:
		// { '1': [1, 2, width+2, (width*2)+2, (width*3)+2, (width*4)+1, (width*4)+2, (width*4)+3] }
		// use the original method:
		// characterMaps[char.toUpperCase()].forEach(charPixel => textPixels[charPixel + position] = color);

		// for absolute coordinates like:
		// { '1': [1, 2, 7, 12, 17, 21, 22, 23] }
		// we'll need to infer when to add the width of the canvas to them
		// take a coordinate
		// divide by the charater width (5 in this case)
		// round the result down
		// Math.floor(coord / charWidth) === row
		// coord % charWidth === the position inside the row
		// this will allow us to store char defs as numbers, not as numbers mixed with expressions
		// should be easier to store and generate programatically
		// but if the character width changes, we'll need new defs and need to pass in the charWidth to this function

		characterMaps[char.toUpperCase()].forEach(charPixel => {
			const charRow = Math.floor(charPixel / charWidth)
			const offset = charPixel % charWidth;
			textPixels[(charRow * width) + offset + position] = color;
		});
	}

	function draw(permittedWidth, textPixels, ctx, pixelScale) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// draw	a frame at a given permitted width
		const pixelsToDraw = (height * permittedWidth)-1;

		outer: for (let column = 0; column < height; column++) {
							for (let row = 0; row < permittedWidth; row++){
								// which pixel do I select from textPixels based on column and row?
								let pixelIndex = row + (column*permittedWidth)
								if (pixelIndex > pixelsToDraw) break outer;
								if (textPixels[pixelIndex] !== undefined) {
									ctx.fillStyle = textPixels[pixelIndex];
									ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
								}
							}
		}
	}

	function generateRandomColors(){
    const random = () => {
        const num = Math.floor(Math.random() * (350 - 50) + 50);
        return num > 255 ? 255 : num;
    }
      const R = random();
      const G = random();
      const B = random();
      const color = `rgb(${R}, ${G}, ${B})`;
      return color;
  }

}