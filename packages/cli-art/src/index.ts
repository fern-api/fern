// cli-art: animated, colorful terminal art from any logo.

export { burst } from "./animations/burst";
export type { LogoAnimationOptions } from "./animations/common";
export { filings } from "./animations/filings";
export { orb } from "./animations/orb";
export { reveal } from "./animations/reveal";
export {
    SKYLINE_HEIGHT,
    SKYLINE_MAX_WIDTH,
    SKYLINE_MIN_WIDTH,
    type SkylineOptions,
    skyline
} from "./animations/skyline";
export { type SpinOptions, spin } from "./animations/spin";
export { type Animation, CELL_ASPECT, sizeForAspect } from "./core/animation";
export { gradient, mix, parseColor, type Rgb, shade, toHex } from "./core/color";
export {
    type Cell,
    type ColorMode,
    detectColorMode,
    emptyFrame,
    type Frame,
    frameToLines,
    frameToText,
    setCell
} from "./core/frame";
export { type OutputStream, type PlayOptions, play, visibleWidth } from "./core/player";
export { FERN_LOGO } from "./examples";
export { dominantColors, type Palette, paletteFromColor, paletteFromShape } from "./palette";
export { decodePng, type Pixels } from "./shapes/png";
export { rasterize } from "./shapes/raster";
export { fromPixels, fromPng, fromSvg, fromSvgPath, loadShape, type Shape, type ShapeSample } from "./shapes/shape";
