import type { Frame } from "./frame";

/** A piece of terminal art that can be drawn at any frame number. */
export interface Animation {
    readonly width: number;
    readonly height: number;
    /** Frames in one full run; players show at least this many. */
    readonly duration: number;
    /** The frame to show when the animation comes to rest, or when it can't animate. */
    readonly restFrame: number;
    /** Whether the animation can stop at this frame (for example, a spinning logo facing forward). */
    canStop(frame: number): boolean;
    render(frame: number): Frame;
}

/** Terminal cells are roughly this many times taller than they are wide. */
export const CELL_ASPECT = 2.2;

/** The cell size that shows a box with the given aspect ratio (width / height) at a target height. */
export function sizeForAspect(aspectRatio: number, height: number): { width: number; height: number } {
    return { width: Math.max(1, Math.round(aspectRatio * height * CELL_ASPECT)), height };
}
