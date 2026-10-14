#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { type LogoMode, logoToBanner } from "./logoToBanner.js";

const USAGE = `Usage: fern-terminal-logo <logo.svg|logo.png> [options]

Converts a logo into terminal art for the CLI generator's \`banner.file\`.

Options:
  -o, --output <file>   Write the banner here (default: print to stdout)
  -w, --width <cols>    Width in terminal columns (default: 64)
  -m, --mode <mode>     color (keep the logo's colours) or shape (plain blocks,
                        coloured by banner.colors at runtime). Default: color
  -h, --help            Show this help`;

function main(): void {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            output: { type: "string", short: "o" },
            width: { type: "string", short: "w" },
            mode: { type: "string", short: "m" },
            help: { type: "boolean", short: "h" }
        }
    });

    const input = positionals[0];
    if (values.help === true || input == null) {
        process.stdout.write(`${USAGE}\n`);
        process.exitCode = input == null && values.help !== true ? 1 : 0;
        return;
    }
    if (values.mode != null && !isLogoMode(values.mode)) {
        throw new Error(`Invalid --mode: expected "color" or "shape", got "${values.mode}".`);
    }

    const banner = logoToBanner(readFileSync(input), {
        width: values.width != null ? Number(values.width) : undefined,
        mode: values.mode
    });
    if (values.output != null) {
        writeFileSync(values.output, banner);
    } else {
        process.stdout.write(banner);
    }
}

function isLogoMode(value: string): value is LogoMode {
    return value === "color" || value === "shape";
}

try {
    main();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
}
