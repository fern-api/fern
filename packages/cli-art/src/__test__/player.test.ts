import { describe, expect, it } from "vitest";
import type { Animation } from "../core/animation";
import { detectColorMode, emptyFrame, frameToLines, setCell } from "../core/frame";
import { type OutputStream, play, visibleWidth } from "../core/player";

function counter(): Animation & { rendered: number[] } {
    const rendered: number[] = [];
    return {
        rendered,
        width: 3,
        height: 1,
        duration: 10,
        restFrame: 9,
        canStop: () => true,
        render(frame) {
            rendered.push(frame);
            const grid = emptyFrame(3, 1);
            setCell(grid, 0, 0, { char: String(frame % 10) });
            return grid;
        }
    };
}

function capture(): { stream: OutputStream; output: () => string } {
    let text = "";
    const stream: OutputStream = {
        isTTY: false,
        write(chunk) {
            text += chunk;
            return true;
        }
    };
    return { stream, output: () => text };
}

describe("play", () => {
    it("prints only the resting frame when the output isn't a terminal", async () => {
        const animation = counter();
        const { stream, output } = capture();
        const result = await play(animation, { stream, until: Promise.resolve("detected"), colorMode: "none" });
        expect(result).toBe("detected");
        expect(output()).toBe("9  \n");
        expect(animation.rendered).toEqual([0, 9]);
    });

    it("passes every frame through compose", async () => {
        const { stream, output } = capture();
        await play(counter(), {
            stream,
            colorMode: "none",
            compose: (art, _, done) => art.map((line) => `${line}|${done}`)
        });
        expect(output()).toBe("9  |true\n");
    });
});

describe("frames", () => {
    it("colors cells for each color mode", () => {
        const grid = emptyFrame(2, 1);
        setCell(grid, 0, 0, { char: "x", color: [255, 0, 0], bold: true });
        expect(frameToLines(grid, "none")).toEqual(["x "]);
        expect(frameToLines(grid, "truecolor")[0]).toContain("38;2;255;0;0m");
        expect(frameToLines(grid, "256")[0]).toContain("38;5;196");
        expect(visibleWidth(frameToLines(grid, "truecolor")[0] ?? "")).toBe(2);
    });

    it("detects color support from the environment", () => {
        const tty = { isTTY: true };
        expect(detectColorMode(tty, { NO_COLOR: "1", COLORTERM: "truecolor" })).toBe("none");
        expect(detectColorMode(tty, { COLORTERM: "truecolor" })).toBe("truecolor");
        expect(detectColorMode(tty, { TERM: "xterm-256color" })).toBe("256");
        expect(detectColorMode({ isTTY: false }, {})).toBe("none");
    });
});
