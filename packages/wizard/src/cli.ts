#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: CLI reports failures to stderr.
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { WizardFlags } from "./types";
import { runWizard } from "./wizard";

const VERSION = process.env.npm_package_version ?? "0.1.0";

void yargs(hideBin(process.argv))
    .scriptName("fern-wizard")
    .usage("$0 [options]")
    .option("dir", { type: "string", default: process.cwd(), describe: "Repository directory" })
    .option("yes", { type: "boolean", default: false, describe: "Accept defaults without prompting" })
    .option("dry-run", {
        type: "boolean",
        default: false,
        describe: "Print the plan without writing or running commands"
    })
    .option("skip-install", { type: "boolean", default: false, describe: "Skip Fern CLI installation" })
    .option("org", { type: "string", describe: "Fern organization" })
    .version(VERSION)
    .help()
    .strict()
    .parseAsync()
    .then(async (argv) => {
        const flags: WizardFlags = {
            dir: argv.dir,
            yes: argv.yes,
            dryRun: argv["dry-run"],
            skipInstall: argv.skipInstall,
            org: argv.org
        };
        const exitCode = await runWizard(flags);
        if (exitCode !== 0) {
            process.exitCode = exitCode;
        }
    })
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    });
