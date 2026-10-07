import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import os from "os";
import path from "path";
import { type OrbCell, type OrbFrame, renderOrbFrame } from "./orb";
import type { ApiSpec, Detection } from "./types";

// Terminal cells are roughly 2.3 times taller than they are wide, so this grid draws a round orb.
const ORB_WIDTH = 34;
const ORB_HEIGHT = 15;
const GAP = 3;
const MIN_INFO_WIDTH = 28;
const FRAME_INTERVAL_MS = 33;
const FRAMES_PER_TURN = 48;
// The orb always spins at least this many full turns (about 3 seconds) while the progress bar fills.
const MIN_TURNS = 2;
const MIN_FRAMES = FRAMES_PER_TURN * MIN_TURNS;
const PROGRESS_BLOCKS = 8;
// Directory, API specs, Frameworks, Docs, Coding agents, Package manager, Fern project, Fern CLI.
const SUMMARY_ROWS = 8;

const DARK_GREEN: Rgb = [22, 88, 10];
const BRIGHT_GREEN: Rgb = [118, 255, 72];
const GLASS_DARK: Rgb = [12, 62, 42];
const GLASS_BRIGHT: Rgb = [128, 242, 196];
const GLINT: Rgb = [228, 255, 236];
const accent = chalk.rgb(...BRIGHT_GREEN).bold;
const text = chalk.rgb(186, 245, 166);
const muted = chalk.rgb(72, 140, 56);

type Rgb = [number, number, number];

type DetectionState =
    | { status: "pending" }
    | { status: "done"; detection: Detection }
    | { status: "failed"; error: unknown };

/**
 * Shows the Fern logo spinning in 3D while the repository is scanned, then settles on a
 * neofetch-style summary of what was detected. Falls back to a single static frame when
 * stdout is not an interactive terminal or is too short to redraw the frame in place.
 */
export async function showSplash(dir: string, detectionPromise: Promise<Detection>): Promise<Detection> {
    // Redrawing moves the cursor up over the previous frame, which only works when the whole frame
    // fits on screen; otherwise every frame would be left behind in the scrollback.
    const fitsOnScreen = (process.stdout.rows ?? 0) > ORB_HEIGHT && orbFitsBesideSummary();
    const animate =
        process.stdout.isTTY === true && process.env.TERM !== "dumb" && process.env.CI === undefined && fitsOnScreen;
    if (!animate) {
        const detection = await detectionPromise;
        process.stdout.write(`${composeScreen(0, dir, detection, 0).join("\n")}\n`);
        return detection;
    }

    // Held in an object so the animation loop re-reads the state the background task updates.
    const tracker: { state: DetectionState } = { state: { status: "pending" } };
    void (async () => {
        // Errors are surfaced below once the animation loop observes the failed state.
        try {
            tracker.state = { status: "done", detection: await detectionPromise };
        } catch (error) {
            tracker.state = { status: "failed", error };
        }
    })();

    const showCursor = (): void => {
        process.stdout.write("\x1b[?25h");
    };
    // Ctrl-C would otherwise exit without running "exit" listeners and leave the cursor hidden.
    const interrupt = (): void => {
        showCursor();
        process.exit(130);
    };
    process.stdout.write("\x1b[?25l");
    process.once("exit", showCursor);
    process.once("SIGINT", interrupt);
    let previousLineCount = 0;
    const draw = (lines: string[]): void => {
        const moveUp = previousLineCount > 0 ? `\x1b[${previousLineCount}A` : "";
        process.stdout.write(`${moveUp}${lines.map((line) => `\r\x1b[2K${line}`).join("\n")}\n`);
        previousLineCount = lines.length;
    };

    try {
        // Spin for the minimum number of turns, keep spinning while detection runs, and stop facing forward.
        let frame = 0;
        while (frame < MIN_FRAMES || tracker.state.status === "pending" || frame % FRAMES_PER_TURN !== 0) {
            const angle = (2 * Math.PI * frame) / FRAMES_PER_TURN;
            draw(composeScreen(angle, dir, undefined, frame));
            await sleep(FRAME_INTERVAL_MS);
            frame++;
        }
        const finalState = tracker.state;
        if (finalState.status === "failed") {
            throw finalState.error;
        }
        draw(composeScreen(0, dir, finalState.detection, frame));
        return finalState.detection;
    } finally {
        showCursor();
        process.removeListener("exit", showCursor);
        process.removeListener("SIGINT", interrupt);
    }
}

function composeScreen(angle: number, dir: string, detection: Detection | undefined, frame: number): string[] {
    if (!orbFitsBesideSummary()) {
        // Too narrow to sit the orb beside the summary, so show just the summary.
        return infoLines(dir, detection, frame, terminalColumns() - 1);
    }
    const orb = colorizeOrb(renderOrbFrame({ angle, width: ORB_WIDTH, height: ORB_HEIGHT }));
    const info = infoLines(dir, detection, frame, terminalColumns() - ORB_WIDTH - GAP - 1);
    const offset = Math.max(0, Math.floor((ORB_HEIGHT - info.length) / 2));
    return orb.map((line, index) => `${line}${" ".repeat(GAP)}${info[index - offset] ?? ""}`);
}

function orbFitsBesideSummary(): boolean {
    return terminalColumns() - ORB_WIDTH - GAP - 1 >= MIN_INFO_WIDTH;
}

function terminalColumns(): number {
    // Some pseudo-terminals report 0 columns; fall back to a typical width.
    return process.stdout.columns || 120;
}

function colorizeOrb(frame: OrbFrame): string[] {
    return frame.map((row) => row.map((cell) => (cell === undefined ? " " : colorizeCell(cell))).join(""));
}

function colorizeCell({ layer, intensity }: OrbCell): string {
    switch (layer) {
        case "logo":
            // A gamma below 1 keeps the forward-facing side vivid while the edges stay dark.
            return chalk.rgb(...mix(DARK_GREEN, BRIGHT_GREEN, intensity ** 0.6))(logoGlyph(intensity));
        case "rim":
            return chalk.rgb(...mix(GLASS_DARK, GLASS_BRIGHT, intensity))(rimGlyph(intensity));
        case "grid":
            return chalk.rgb(...mix(GLASS_DARK, GLASS_BRIGHT, intensity * 0.6))("·");
        case "glint":
            return chalk.rgb(...GLINT).bold("*");
        default:
            return assertNever(layer);
    }
}

function logoGlyph(luminance: number): string {
    if (luminance < 0.3) {
        return ".";
    }
    if (luminance < 0.5) {
        return ":";
    }
    return luminance < 0.93 ? "f" : "F";
}

function rimGlyph(intensity: number): string {
    if (intensity < 0.3) {
        return ".";
    }
    if (intensity < 0.55) {
        return ":";
    }
    return intensity < 0.8 ? "o" : "O";
}

function infoLines(dir: string, detection: Detection | undefined, frame: number, width: number): string[] {
    const title = `fern@${path.basename(dir)}`;
    const header = [accent(truncate(title, width)), muted("-".repeat(Math.min(title.length, width)))];
    if (detection === undefined) {
        const dots = ".".repeat(Math.floor(frame / 6) % 4);
        // Same height as the finished summary, so the progress bar fills in exactly where it ends up.
        return [
            ...header,
            `${accent("Scanning")}${text(`: ${truncate(displayPath(dir), width - 13)}${dots}`)}`,
            ...new Array<string>(SUMMARY_ROWS - 1).fill(""),
            "",
            progressBar(scanningProgress(frame))
        ];
    }
    const rows: Array<[string, string]> = [
        ["Directory", displayPath(dir)],
        ["API specs", describeSpecs(detection.apiSpecs)],
        ["Frameworks", list(detection.frameworks.map((framework) => framework.name))],
        ["Docs", list(detection.docsTools.map((tool) => `${tool.name} (${tool.path})`))],
        ["Coding agents", list(detection.agents)],
        ["Package manager", detection.hasPackageJson ? detection.packageManager : "none (no package.json)"],
        ["Fern project", detection.fernProject.exists ? (detection.fernProject.path ?? "fern/") : "not initialized"],
        ["Fern CLI", detection.fernCliVersion ?? "not installed"]
    ];
    return [
        ...header,
        ...rows.map(([label, value]) => `${accent(label)}${text(`: ${truncate(value, width - label.length - 2)}`)}`),
        "",
        progressBar(PROGRESS_BLOCKS)
    ];
}

function describeSpecs(specs: ApiSpec[]): string {
    const primary = specs.find((spec) => spec.format === "openapi") ?? specs[0];
    if (primary === undefined) {
        return "none found";
    }
    const version = primary.version === undefined ? "" : ` ${primary.version}`;
    const more = specs.length > 1 ? ` +${specs.length - 1} more` : "";
    return `${primary.path} (${primary.format}${version})${more}`;
}

/**
 * Number of progress blocks to light while scanning: one more every few frames over the minimum spin,
 * holding back the last block until the scan has actually finished.
 */
export function scanningProgress(frame: number): number {
    return Math.min(PROGRESS_BLOCKS - 1, Math.floor((frame / MIN_FRAMES) * PROGRESS_BLOCKS));
}

function progressBar(lit: number): string {
    return Array.from({ length: PROGRESS_BLOCKS }, (_, index) =>
        index < lit
            ? chalk.rgb(...mix(DARK_GREEN, BRIGHT_GREEN, index / (PROGRESS_BLOCKS - 1)))("███")
            : chalk.rgb(...GLASS_DARK)("░░░")
    ).join("");
}

function list(values: string[]): string {
    return values.length === 0 ? "none" : values.join(", ");
}

function displayPath(dir: string): string {
    const home = os.homedir();
    return dir === home || dir.startsWith(`${home}${path.sep}`) ? `~${dir.slice(home.length)}` : dir;
}

function truncate(value: string, width: number): string {
    if (width <= 1) {
        return "";
    }
    return value.length <= width ? value : `${value.slice(0, width - 1)}…`;
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
    const clamped = Math.min(1, Math.max(0, amount));
    return [
        Math.round(from[0] + (to[0] - from[0]) * clamped),
        Math.round(from[1] + (to[1] - from[1]) * clamped),
        Math.round(from[2] + (to[2] - from[2]) * clamped)
    ];
}

async function sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
