// biome-ignore-all lint/suspicious/noConsole: a command-line preview tool.
import { burst } from "./animations/burst";
import { filings } from "./animations/filings";
import { orb } from "./animations/orb";
import { reveal } from "./animations/reveal";
import { skyline } from "./animations/skyline";
import { spin } from "./animations/spin";
import type { Animation } from "./core/animation";
import { play } from "./core/player";
import { FERN_LOGO } from "./examples";
import { fromSvgPath, loadShape, type Shape } from "./shapes/shape";

const ANIMATIONS: Record<
    string,
    (shape: Shape, options: { width?: number; height?: number; glyph?: string }) => Animation
> = {
    burst,
    filings,
    orb,
    reveal,
    spin,
    skyline: (shape, options) => skyline({ logo: shape, width: options.width, glyph: options.glyph })
};

const USAGE = `Usage: cli-art <animation> [--logo file.svg|file.png] [--width N] [--height N] [--glyph C] [--loop]

Animations: ${Object.keys(ANIMATIONS).join(", ")}

Without --logo, the Fern logo is used.`;

async function main(argv: string[]): Promise<number> {
    const [name, ...rest] = argv;
    if (name === undefined || name === "--help" || name === "-h") {
        console.log(USAGE);
        return name === undefined ? 1 : 0;
    }
    const create = ANIMATIONS[name];
    if (create === undefined) {
        console.error(`Unknown animation "${name}".\n\n${USAGE}`);
        return 1;
    }
    const flags = parseFlags(rest);
    const logo = flags.get("logo");
    const shape = logo === undefined ? fromSvgPath(FERN_LOGO.path, { color: FERN_LOGO.color }) : await loadShape(logo);
    const number = (key: string): number | undefined => {
        const value = flags.get(key);
        return value === undefined ? undefined : Number(value);
    };
    const animation = create(shape, { width: number("width"), height: number("height"), glyph: flags.get("glyph") });
    do {
        await play(animation);
    } while (flags.has("loop"));
    return 0;
}

function parseFlags(args: string[]): Map<string, string> {
    const flags = new Map<string, string>();
    for (let index = 0; index < args.length; index++) {
        const arg = args[index] ?? "";
        if (!arg.startsWith("--")) {
            continue;
        }
        const key = arg.slice(2);
        const next = args[index + 1];
        if (next !== undefined && !next.startsWith("--")) {
            flags.set(key, next);
            index++;
        } else {
            flags.set(key, "true");
        }
    }
    return flags;
}

void main(process.argv.slice(2))
    .then((code) => {
        process.exitCode = code;
    })
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
