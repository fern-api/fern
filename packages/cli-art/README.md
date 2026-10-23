# @fern-api/cli-art

Animated, colorful terminal art from any logo. Give it an SVG or PNG and it draws the logo in the
terminal with shading, an extruded 3D drop, and colors pulled from the logo itself, then animates it
in with one of several effects. Zero runtime dependencies.

```sh
npx @fern-api/cli-art reveal --logo ./logo.svg
npx @fern-api/cli-art burst --logo ./logo.png --glyph "#"
```

## Animations

| Name      | What it does                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------ |
| `reveal`  | A diagonal wipe of light draws the logo in, glowing through the logo's own colors.               |
| `burst`   | A single dot explodes into ASCII sparks that swirl back in and land as the logo.                 |
| `filings` | Loose iron filings shake until they line up into the logo, as if a magnet sat underneath.         |
| `spin`    | The logo as an extruded 3D solid, turning around its vertical axis.                              |
| `orb`     | The logo spinning inside a glass orb with a glowing rim, a glint, and turning grid lines.        |
| `skyline` | The Manhattan skyline at night through the Brooklyn Bridge railing, with a logo and tagline.     |

## Library

```ts
import { loadShape, play, reveal } from "@fern-api/cli-art";

const logo = await loadShape("logo.svg");
await play(reveal(logo));
```

`play` animates in place on an interactive terminal and prints just the final frame everywhere else
(pipes, CI, `TERM=dumb`, or a terminal too small to redraw the art without scrolling). It hides the
cursor while drawing and restores it on exit and Ctrl-C.

Keep animating while work runs in the background, and arrange the art next to your own output:

```ts
const result = await play(burst(logo), {
    until: scanRepository(),
    compose: (art, frame, done) => art.map((line, row) => `${line}   ${status[row] ?? ""}`)
});
```

### Shapes

- `loadShape(path)` reads an `.svg` or `.png` file.
- `fromSvg(source)` supports paths and basic shapes, group fills and transforms, `fill-rule`, and
  linear and radial gradients (stops, units, `gradientTransform`, `href`).
- `fromPng(buffer)` decodes PNGs of any color type and bit depth. Opaque images have a flat background
  keyed out using the corner colors, and every image is cropped to its visible content.
- `fromSvgPath(d, { color })` takes a single path's `d` attribute.

### Colors

Each animation takes a `palette` that is merged over one pulled from the logo: `dominantColors(shape)`
finds the most prominent colors (favoring saturated brand colors over near-white and near-black), and
a multi-color logo keeps its own gradient wherever it's drawn. To draw every logo in fixed brand
colors instead, pass a `logo` ramp from dark to bright:

```ts
burst(logo, { glyph: "f", palette: { logo: [[22, 88, 10], [118, 255, 72]] } });
```

Output uses 24-bit color when the terminal supports it, falling back to 256 colors, and respects
`NO_COLOR` and `FORCE_COLOR`.

### Custom animations

An `Animation` is a pure function from frame number to a grid of `{ char, color, bold }` cells, so
anything you write plays with `play`, and frames render the same way every time:

```ts
const animation: Animation = {
    width: 20,
    height: 5,
    duration: 60,
    restFrame: 59,
    canStop: (frame) => frame >= 59,
    render: (frame) => { /* return a Frame */ }
};
```
