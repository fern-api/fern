#!/usr/bin/env node
// biome-ignore-all lint/suspicious/noConsole: CLI prints help and reports failures to stderr.
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CLI_OPTIONS, HELP_TEXT, PRODUCTS, SPLASH_STYLES } from "./cli-options";
import { layoutFromFlag } from "./docs-site/options";
import type { WizardFlags } from "./types";
import { runWizard } from "./wizard";

// Set at build time (see build.mjs).
const VERSION = process.env.WIZARD_VERSION ?? "0.0.0-dev";

void yargs(hideBin(process.argv))
    .scriptName("fern-wizard")
    // Turn off yargs' generated help before declaring the wizard's own --help.
    .help(false)
    .options(CLI_OPTIONS)
    .version(VERSION)
    .strict()
    .fail((message, error) => {
        console.error(error?.message ?? message);
        console.error("Run fern-wizard --help to see the options.");
        process.exit(1);
    })
    .parseAsync()
    .then(async (argv) => {
        if (argv.help) {
            console.log(HELP_TEXT);
            return;
        }
        const flags: WizardFlags = {
            dir: argv.dir,
            yes: argv.yes,
            dryRun: argv.dryRun,
            skipInstall: argv.skipInstall,
            org: argv.org,
            template: layoutFromFlag(argv.template),
            splash: SPLASH_STYLES.find((style) => style === argv.splash),
            brand: argv.brand,
            skipBrand: argv.skipBrand,
            products:
                argv.products === undefined
                    ? undefined
                    : PRODUCTS.filter((product) => argv.products?.includes(product)),
            spec: argv.spec,
            skipMcp: argv.skipMcp
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
