import { describe, expect, it } from "vitest";
import { BURST_LANDED, burst } from "../animations/burst";
import { burstSpin } from "../animations/burst-spin";
import { filings } from "../animations/filings";
import { orb } from "../animations/orb";
import { reveal } from "../animations/reveal";
import { SKYLINE_HEIGHT, skyline } from "../animations/skyline";
import { spin } from "../animations/spin";
import type { Animation } from "../core/animation";
import { type Frame, frameToLines, frameToText } from "../core/frame";
import { FERN_LOGO } from "../examples";
import { dominantColors, paletteFromShape } from "../palette";
import { fromSvg, fromSvgPath } from "../shapes/shape";

const fern = fromSvgPath(FERN_LOGO.path, { color: FERN_LOGO.color });
const twoTone = fromSvg(
    `<svg viewBox="0 0 20 10"><rect width="10" height="10" fill="#1e6bff"/><rect x="10" width="10" height="10" fill="#3ddc84"/></svg>`
);

function drawn(frame: Frame): Array<{ char: string }> {
    return frame.flat().filter((cell) => cell !== undefined);
}

/** Frame numbers whose grid doesn't match the animation's declared size. */
function misshapenFrames(animation: Animation): number[] {
    const misshapen: number[] = [];
    for (let frame = 0; frame <= animation.duration; frame += 7) {
        const rendered = animation.render(frame);
        if (rendered.length !== animation.height || rendered.some((row) => row.length !== animation.width)) {
            misshapen.push(frame);
        }
    }
    return misshapen;
}

describe("animations", () => {
    it.each([
        ["burst", burst(fern)],
        ["burst-spin", burstSpin(fern)],
        ["burst-spin (wide logo)", burstSpin(twoTone)],
        ["filings", filings(fern)],
        ["orb", orb(fern)],
        ["spin", spin(fern)],
        ["reveal", reveal(fern)],
        ["skyline", skyline({ logo: fern, tagline: "Made in Brooklyn" })]
    ])("%s renders deterministic frames of a fixed size", (_, animation) => {
        expect(misshapenFrames(animation)).toEqual([]);
        expect(animation.canStop(animation.restFrame)).toBe(true);
        expect(animation.render(33)).toEqual(animation.render(33));
    });

    it("burst starts as a single dot and explodes into sparks", () => {
        const animation = burst(fern);
        expect(drawn(animation.render(0))).toHaveLength(1);
        expect(drawn(animation.render(30)).length).toBeGreaterThan(60);
    });

    it("burst and filings settle into the same logo, drawn with the chosen glyph", () => {
        const fromBurst = burst(fern, { glyph: "f" });
        const fromFilings = filings(fern, { glyph: "f" });
        const settled = drawn(fromBurst.render(fromBurst.restFrame));
        expect(settled.length).toBeGreaterThan(50);
        expect(settled.every((cell) => cell.char === "f")).toBe(true);
        expect(frameToText(fromFilings.render(fromFilings.restFrame))).toEqual(
            frameToText(fromBurst.render(fromBurst.restFrame))
        );
    });

    it("burst-spin starts as a single dot, lands facing forward, and ends a full turn later", () => {
        const animation = burstSpin(fern);
        expect(drawn(animation.render(0))).toHaveLength(1);
        expect(frameToText(animation.render(BURST_LANDED))).toEqual(frameToText(animation.render(BURST_LANDED + 1)));
        expect(frameToText(animation.render(animation.duration))).toEqual(frameToText(animation.render(BURST_LANDED)));
    });

    it("burst-spin turns in place, without tilting or bobbing", () => {
        const stripes = fromSvg(
            `<svg viewBox="0 0 20 10"><rect width="20" height="4" fill="#1e6bff"/><rect y="6" width="20" height="4" fill="#1e6bff"/></svg>`
        );
        const animation = burstSpin(stripes);
        const rowsDrawn = (frame: number): number[] =>
            animation.render(frame).flatMap((row, index) => (row.some((cell) => cell !== undefined) ? [index] : []));
        const resting = rowsDrawn(animation.restFrame);
        for (let frame = BURST_LANDED; frame <= animation.duration; frame += 3) {
            expect(rowsDrawn(frame)).toEqual(resting);
        }
        expect(frameToText(animation.render(BURST_LANDED + 24))).not.toEqual(
            frameToText(animation.render(BURST_LANDED))
        );
    });

    it("burst-spin packs two pixels per cell with half blocks", () => {
        const animation = burstSpin(twoTone);
        const settled = drawn(animation.render(animation.restFrame));
        expect(settled.length).toBeGreaterThan(50);
        expect(settled.every((cell) => "▀▄█".includes(cell.char))).toBe(true);
    });

    it("draws a cell's background color for the lower half of a half block", () => {
        const [line] = frameToLines([[{ char: "▀", color: [255, 0, 0], background: [0, 0, 255] }]], "truecolor");
        expect(line).toContain("\u001B[38;2;255;0;0m");
        expect(line).toContain("\u001B[48;2;0;0;255m");
    });

    it("reveal wipes the logo in from the left", () => {
        const animation = reveal(twoTone);
        const halfway = frameToText(animation.render(18));
        const leftHalf = halfway.map((line) => line.slice(0, animation.width / 3)).join("");
        const rightHalf = halfway.map((line) => line.slice((animation.width * 2) / 3)).join("");
        expect(leftHalf.trim().length).toBeGreaterThan(0);
        expect(rightHalf.trim()).toBe("");
        expect(drawn(animation.render(animation.restFrame)).length).toBeGreaterThan(drawn(animation.render(18)).length);
    });

    it("reveal sizes itself to the logo's proportions", () => {
        expect(reveal(twoTone, { height: 10 }).width).toBeGreaterThan(reveal(fern, { height: 10 }).width);
    });

    it("orb keeps the logo inside a round glass rim", () => {
        const [top] = frameToText(orb(fern).render(0));
        expect(top?.trim().length).toBeGreaterThan(0);
        expect(top?.startsWith(" ")).toBe(true);
    });

    it("skyline types out the tagline", () => {
        const animation = skyline({ tagline: "Made in Brooklyn" });
        expect(frameToText(animation.render(0))[SKYLINE_HEIGHT - 1]).not.toContain("Brooklyn");
        expect(frameToText(animation.render(animation.restFrame))[SKYLINE_HEIGHT - 1]).toContain("Made in Brooklyn");
    });
});

describe("palette", () => {
    it("pulls the logo's colors, most prominent first", () => {
        const colors = dominantColors(twoTone, 2);
        expect(colors).toHaveLength(2);
        expect(colors).toContainEqual([0x1e, 0x6b, 0xff]);
        expect(colors).toContainEqual([0x3d, 0xdc, 0x84]);
    });

    it("builds accents from every brand color in a multi-color logo", () => {
        expect(paletteFromShape(twoTone).accents).toHaveLength(2);
        expect(paletteFromShape(fern).accents).toHaveLength(1);
    });

    it("draws the settled logo in its own colors", () => {
        const animation = reveal(twoTone);
        const colors = animation
            .render(animation.restFrame)
            .flat()
            .flatMap((cell) => (cell?.color === undefined ? [] : [cell.color]));
        const blueish = colors.filter(([red, , blue]) => blue > red + 80);
        const greenish = colors.filter(([red, green, blue]) => green > blue && green > red + 80);
        expect(blueish.length).toBeGreaterThan(10);
        expect(greenish.length).toBeGreaterThan(10);
    });
});
