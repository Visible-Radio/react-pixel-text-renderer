# react-pixel-text-renderer
A reusable react component that renders a string to a canvas element.

The function component can be called without any props like this:

Resulting in the a canvas with some sample text and randomized colors.

It could also be called like this:

<TextRenderer bgColor = {'rgba(0,10,50,1)'} color = {[230, 0, 190]} text={"it's good it's bad its ugly it's a pixel text renderer."} scale={20} charSpaces={8} animate={true} />

PROPS bgColor Accepts any CSS color value. It simply styles the background of the canvas element. Omitting it results in a transparent background.

color An optional array of three 8 bit rgb values. It controls the text color. Omitting it results in characters with random colors biased so as to be brighter in order to contrast well against darker backgrounds.

text The string to be rendered.

charSpaces Defines the number of characters to be drawn horizontally before wrapping to a new row. Setting this to 1 will result in a vertical column of text. Omitting it will size the canvas to fit the length of the input text.

animate Defaults false. If set to true, when the text is rendered it will do so with an animation.
