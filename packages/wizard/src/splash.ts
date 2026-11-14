import {
    type Animation,
    burst,
    burstSpin,
    FERN_LOGO,
    filings,
    fromSvgPath,
    mix,
    orb,
    type Palette,
    play,
    type Rgb,
    SKYLINE_MAX_WIDTH,
    SKYLINE_MIN_WIDTH,
    skyline
} from "@fern-api/cli-art";
import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import os from "os";
import path from "path";
import type { ApiSpec, Detection, SplashStyle } from "./types";

// Terminal cells are roughly 2.3 times taller than they are wide, so this grid draws a round orb.
const ORB_WIDTH = 34;
const ORB_HEIGHT = 15;
// The particle animations (burst, burst-spin, filings) use a smaller canvas with the same proportions.
const PARTICLE_ART_WIDTH = 28;
const PARTICLE_ART_HEIGHT = 12;
const GAP = 3;
const MIN_INFO_WIDTH = 28;
// One slow turn takes about 3.2 seconds.
const FRAMES_PER_TURN = 96;
// After the burst lands, the logo turns once more quickly (2 seconds), so the splash stays short.
const BURST_SPIN_FRAMES_PER_TURN = 60;
// The animation always runs at least this long while the progress bar fills.
const MIN_FRAMES = FRAMES_PER_TURN;
const PROGRESS_BLOCKS = 8;
// Directory, API specs, Frameworks, Docs, Coding agents, Package manager, Fern project, Fern CLI.
const SUMMARY_ROWS = 8;

const DARK_GREEN: Rgb = [22, 88, 10];
const BRIGHT_GREEN: Rgb = [118, 255, 72];
const GLASS_DARK: Rgb = [12, 62, 42];
const accent = chalk.rgb(...BRIGHT_GREEN).bold;
const text = chalk.rgb(186, 245, 166);
const muted = chalk.rgb(72, 140, 56);

/** Fern's greens, drawn with "f"s. */
const FERN_PALETTE: Partial<Palette> = {
    logo: [DARK_GREEN, BRIGHT_GREEN],
    depth: [24, 62, 16],
    spark: [[228, 255, 236], BRIGHT_GREEN, DARK_GREEN],
    glass: [GLASS_DARK, [128, 242, 196]],
    filing: [
        [58, 64, 62],
        [196, 206, 200]
    ]
};
const GLYPH = "f";
// "fern" in the figlet "small" style.
const WORDMARK = ["  __                 ", " / _| ___  _ _  _ _  ", "|  _|/ -_)| '_|| ' \\ ", "|_|  \\___||_|  |_||_|"];

/**
 * Animates the Fern logo while the repository is scanned, then settles on a neofetch-style summary of
 * what was detected. Falls back to a single static frame when stdout is not an interactive terminal or
 * is too small to redraw the frame in place.
 */
export async function showSplash(
    dir: string,
    detectionPromise: Promise<Detection>,
    style: SplashStyle = "burst-spin"
): Promise<Detection> {
    const animation = createAnimation(style);
    // Held in an object so composing the final frame sees the finished detection.
    const tracker: { detection?: Detection } = {};
    const until = (async () => {
        tracker.detection = await detectionPromise;
        return tracker.detection;
    })();
    await play(animation, {
        until,
        minFrames: MIN_FRAMES,
        compose: (art, frame, done) =>
            composeScreen(style, animation, art, frame, dir, done ? tracker.detection : undefined)
    });
    return await until;
}

function createAnimation(style: SplashStyle): Animation {
    const logo = fromSvgPath(FERN_LOGO.path, { color: FERN_LOGO.color });
    switch (style) {
        case "orb":
            return orb(logo, {
                width: ORB_WIDTH,
                height: ORB_HEIGHT,
                framesPerTurn: FRAMES_PER_TURN,
                glyph: GLYPH,
                palette: FERN_PALETTE
            });
        case "burst-spin":
            // Drawn in half-block pixels rather than "f"s, so the turning logo keeps its detail.
            return burstSpin(logo, {
                width: PARTICLE_ART_WIDTH,
                height: PARTICLE_ART_HEIGHT,
                framesPerTurn: BURST_SPIN_FRAMES_PER_TURN,
                palette: FERN_PALETTE
            });
        case "burst":
            return burst(logo, {
                width: PARTICLE_ART_WIDTH,
                height: PARTICLE_ART_HEIGHT,
                glyph: GLYPH,
                palette: FERN_PALETTE
            });
        case "filings":
            return filings(logo, {
                width: PARTICLE_ART_WIDTH,
                height: PARTICLE_ART_HEIGHT,
                glyph: GLYPH,
                palette: FERN_PALETTE
            });
        case "brooklyn":
            return skyline({
                width: sceneWidth(),
                logo,
                glyph: GLYPH,
                wordmark: WORDMARK,
                tagline: "Made in Brooklyn",
                palette: FERN_PALETTE
            });
        default:
            return assertNever(style);
    }
}

function composeScreen(
    style: SplashStyle,
    animation: Animation,
    art: string[],
    frame: number,
    dir: string,
    detection: Detection | undefined
): string[] {
    if (!artFits(style, animation)) {
        // Too narrow for the art, so show just the summary.
        return infoLines(dir, detection, frame, terminalColumns() - 1);
    }
    if (style === "brooklyn") {
        // The scene is a wide banner, so the summary goes underneath it instead of beside it.
        if (detection !== undefined) {
            return [...art, "", ...infoLines(dir, detection, frame, terminalColumns() - 1)];
        }
        const dots = ".".repeat(Math.floor(frame / 6) % 4);
        const status = `${accent("Scanning")}${text(`: ${truncate(displayPath(dir), animation.width - 40)}${dots}`)}`;
        return [...art, "", `${progressBar(scanningProgress(frame))}  ${status}`];
    }
    const info = infoLines(dir, detection, frame, terminalColumns() - animation.width - GAP - 1);
    // Center whichever of the art and the summary is shorter against the other.
    const rows = Math.max(art.length, info.length);
    const artOffset = Math.floor((rows - art.length) / 2);
    const infoOffset = Math.floor((rows - info.length) / 2);
    return Array.from(
        { length: rows },
        (_, index) =>
            `${art[index - artOffset] ?? " ".repeat(animation.width)}${" ".repeat(GAP)}${info[index - infoOffset] ?? ""}`
    );
}

function artFits(style: SplashStyle, animation: Animation): boolean {
    return style === "brooklyn"
        ? terminalColumns() - 1 >= SKYLINE_MIN_WIDTH
        : terminalColumns() - animation.width - GAP - 1 >= MIN_INFO_WIDTH;
}

function sceneWidth(): number {
    return Math.min(SKYLINE_MAX_WIDTH, terminalColumns() - 1);
}

function terminalColumns(): number {
    // Some pseudo-terminals report 0 columns; fall back to a typical width.
    return process.stdout.columns || 120;
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
    const rows = summarizeDetection(dir, detection);
    return [
        ...header,
        ...rows.map(([label, value]) => `${accent(label)}${text(`: ${truncate(value, width - label.length - 2)}`)}`),
        "",
        progressBar(PROGRESS_BLOCKS)
    ];
}

/** What the scan found, as label and value pairs (the splash's summary, and `fern detect`). */
export function summarizeDetection(dir: string, detection: Detection): Array<[string, string]> {
    return [
        ["Directory", displayPath(dir)],
        ["API specs", describeSpecs(detection.apiSpecs)],
        ["Frameworks", list(detection.frameworks.map((framework) => framework.name))],
        ["Docs", list(detection.docsTools.map((tool) => `${tool.name} (${tool.path})`))],
        ["Coding agents", list(detection.agents)],
        ["Package manager", detection.hasPackageJson ? detection.packageManager : "none (no package.json)"],
        ["Fern project", detection.fernProject.exists ? (detection.fernProject.path ?? "fern/") : "not initialized"],
        ["Fern CLI", detection.fernCliVersion ?? "not installed"]
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
