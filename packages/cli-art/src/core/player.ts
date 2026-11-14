import type { Animation } from "./animation";
import { type ColorMode, detectColorMode, frameToLines } from "./frame";

/** Somewhere to draw, such as `process.stdout`. */
export interface OutputStream {
    write(text: string): unknown;
    isTTY?: boolean;
    rows?: number;
    columns?: number;
}

export interface PlayOptions<T = unknown> {
    /** Where to draw. Defaults to stdout. */
    stream?: OutputStream;
    /** Frames per second. Defaults to 30. */
    fps?: number;
    /** Keep animating until this settles; it is awaited and its result returned. */
    until?: Promise<T>;
    /** Minimum frames to show, even if `until` settles sooner. Defaults to the animation's duration. */
    minFrames?: number;
    /**
     * Arranges the art with other content, for example a status panel beside it. `done` is true for
     * the final frame. Every call should return the same number of lines while animating.
     */
    compose?: (art: string[], frame: number, done: boolean) => string[];
    /** Override color detection. */
    colorMode?: ColorMode;
    /** Force animation on or off. By default it animates on an interactive terminal that fits it. */
    animate?: boolean;
}

/**
 * Plays an animation in place, then leaves its resting frame on screen. Falls back to printing the
 * resting frame once when the output isn't an interactive terminal or is too small to redraw in place.
 * Restores the cursor on exit and on Ctrl-C.
 */
export async function play<T = unknown>(animation: Animation, options: PlayOptions<T> = {}): Promise<T | undefined> {
    const stream = options.stream ?? process.stdout;
    const colorMode = options.colorMode ?? detectColorMode(stream);
    const compose = options.compose ?? ((art: string[]) => art);
    const lines = (frame: number, done: boolean): string[] =>
        compose(frameToLines(animation.render(frame), colorMode), frame, done);

    const firstFrame = lines(0, false);
    const animate = options.animate ?? canAnimate(stream, firstFrame);
    if (!animate) {
        const result = await options.until;
        stream.write(`${lines(animation.restFrame, true).join("\n")}\n`);
        return result;
    }

    const tracker: { state: "pending" | "done" | "failed"; result?: T; error?: unknown } = {
        state: options.until === undefined ? "done" : "pending"
    };
    void (async () => {
        // Failures are rethrown once the animation loop sees the failed state.
        try {
            tracker.result = await options.until;
            tracker.state = "done";
        } catch (error) {
            tracker.error = error;
            tracker.state = "failed";
        }
    })();

    const showCursor = (): void => {
        stream.write("\u001B[?25h");
    };
    const interrupt = (): void => {
        showCursor();
        process.exit(130);
    };
    stream.write("\u001B[?25l");
    process.once("exit", showCursor);
    process.once("SIGINT", interrupt);

    let previousLineCount = 0;
    const draw = (frameLines: string[]): void => {
        const moveUp = previousLineCount > 0 ? `\u001B[${previousLineCount}A` : "";
        stream.write(`${moveUp}${frameLines.map((line) => `\r\u001B[2K${line}`).join("\n")}\n`);
        previousLineCount = frameLines.length;
    };

    const interval = 1000 / (options.fps ?? 30);
    const minFrames = options.minFrames ?? animation.duration;
    try {
        let frame = 0;
        while (frame < minFrames || tracker.state === "pending" || !animation.canStop(frame)) {
            draw(frame === 0 ? firstFrame : lines(frame, false));
            await sleep(interval);
            frame++;
        }
        if (tracker.state === "failed") {
            throw tracker.error;
        }
        draw(lines(animation.restFrame, true));
        return tracker.result;
    } finally {
        showCursor();
        process.removeListener("exit", showCursor);
        process.removeListener("SIGINT", interrupt);
    }
}

/**
 * Redrawing moves the cursor up over the previous frame, which only works when the whole frame fits
 * on screen without wrapping; otherwise every frame would be left behind in the scrollback.
 */
function canAnimate(stream: OutputStream, frame: string[]): boolean {
    return (
        stream.isTTY === true &&
        process.env.TERM !== "dumb" &&
        process.env.CI === undefined &&
        (stream.rows ?? 0) > frame.length &&
        frame.every((line) => visibleWidth(line) <= (stream.columns ?? 0))
    );
}

/** Width of a line on screen, ignoring color codes and hyperlinks. */
export function visibleWidth(line: string): number {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching terminal escape sequences.
    return [...line.replace(/\u001B\[[0-9;?]*[A-Za-z]|\u001B\]8;[^\u0007]*\u0007/g, "")].length;
}

async function sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
