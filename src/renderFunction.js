export default function renderText(width, pixelScale, canvasRef, inputText, color, animate=false) {

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

	// calculate how many rows needed for the given input text
	const horizontalChars = parseInt(width/(6)+1,10);
	const rows = Math.ceil(inputText.length / horizontalChars);
	// calculate pixel grid height based on input text
	const height = (rows * 5) + (rows - 1);

 	// set up the text layer canvas
	const canvas = canvasRef.current
	if (canvas === null || canvas === undefined) {
		console.log("couldn't get canvas element")
		return;
	}
	const ctx = canvas.getContext('2d');
	ctx.canvas.width = width * pixelScale;
	ctx.canvas.height = height * pixelScale;

	// character grid coordinates
	// should move these out to a json file
	// an editor would be nice for defining more chars...
	const characterMaps = {
		'0' : [0, 1, 2, 3, 4, width, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+1, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'1': [1, 2, width+2, (width*2)+2, (width*3)+2, (width*4)+1, (width*4)+2, (width*4)+3],
		'2': [0, 1, 2, 3, 4, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'3': [0, 1, 2, 3, 4, width+4, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'4': [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4],
		'5': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+3, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'6': [0, 1, 2, 3, 4, width, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'7': [0, 1, 2, 3, 4, width+4, (width*2)+4, (width*3)+4, (width*4)+4],
		'8': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'9': [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+4, (width*4)+4],
		' ': [],
		'.': [width*4+1],
		',': [width*4+1, (width*5)+1],
		"'": [1, width+1],
		'A' : [2, width+1, width+3, width*2, (width*2)+4, width*3, (width*3)+1, (width*3)+2, (width*3)+3,(width*3)+4, (width*4), (width*4)+4],
		'B' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, width*4, (width*4)+1, (width*4)+2, (width*4)+3],
		'C' : [0, 1, 2, 3, 4, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'D' : [0, 1, 2, 3, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3],
		'E' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'F' : [0, 1, 2, 3, 4, width, (width*2), (width*2), (width*2)+1, (width*2)+2, (width*3), (width*4), (width*4)],
		'G' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'H' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'I' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'J' : [width+4, width*3, (width*2)+4, (width*3)+4, (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'K' : [0, 4, width, width+3, (width*2), (width*2)+1, (width*2)+2, (width*3), (width*3)+3, (width*4), (width*4),(width*4)+4],
		'L' : [0, width, (width*2), (width*3), (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'M' : [0, 4, width, width+1, width+3, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4),(width*4)+4],
		'N' : [0, 4, width, width+1, width+4, (width*2), (width*2)+2, (width*2)+4, (width*3), (width*3)+3, (width*3)+4, (width*4), (width*4),(width*4)+4],
		'O' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'P' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3), width*4],
		'Q' : [0, 1, 2, 3, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4, (width*5)+2, (width*3)+2],
		'R' : [0,1,2,3, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, width*3, (width*3)+3, width*4, (width*4)+4],
		'S' : [0, 1, 2, 3, 4, width, (width*2), (width*2)+4, (width*2)+1, (width*2)+2, (width*2)+3, (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'T' : [0, 1, 2, 3, 4, width+2, (width*2)+2, (width*3)+2, (width*4)+2],
		'U' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3), (width*3)+4, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
		'V' : [0, 4, width, width+4, (width*2), (width*2)+4, (width*3)+1, (width*3)+3, (width*4)+2],
		'W' : [0, 4, width, width+4, (width*2), (width*2)+4, width*3, (width*3)+1, (width*3)+3, (width*3)+4, (width*2)+2, width*4, (width*4)+4],
		'X' : [0, 4, width+1, width+3, (width*2)+2, (width*3)+1, (width*3)+3, (width*2)+2, width*4, (width*4)+4],
		'Y' : [0, 4, width, width+4, (width*2), (width*2)+1, (width*2)+2, (width*2)+3, (width*2)+4, (width*3)+2, (width*4)+2],
		'Z' : [0, 1, 2, 3, 4, width+3, (width*2)+2, (width*3)+1, (width*4), (width*4), (width*4)+1, (width*4)+2, (width*4)+3, (width*4)+4],
	}

	let textPixels = [];
	let remaining = horizontalChars;

	writeString(inputText, textPixels);
	if (animate) {
		animatedDraw();
	} else {
		draw(width, textPixels, ctx, pixelScale);
	}

	let currentPermittedWidth = 0;
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

	function writeString(inputText, textPixels) {
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
				position += (width + +1) * 5;
			} else {
				position += 6;
			}
		}
	}

function writeChar(char, textPixels, position, color) {
	characterMaps[char.toUpperCase()].forEach(charPixel => textPixels[charPixel + position] = color);
}

function draw(permittedWidth, textPixels, ctx, pixelScale) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// draw	a frame at a given permitted width
	const pixelsToDraw = (height * permittedWidth)-1;

	// let counter = 0;
	outer: for (let column = 0; column < height; column++) {
						for (let row = 0; row < permittedWidth; row++){
							// which pixel do I select from textPixels based on column and row?
							let pixelIndex = row + (column*permittedWidth)
							if (pixelIndex > pixelsToDraw) break outer;
							if (textPixels[pixelIndex] !== undefined) {
								ctx.fillStyle = textPixels[pixelIndex];
								ctx.fillRect(row*pixelScale, column*pixelScale, pixelScale, pixelScale);
								// counter++;
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