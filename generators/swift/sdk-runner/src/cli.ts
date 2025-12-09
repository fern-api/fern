#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateSwiftSdk } from "./api";

function logInfo(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Temporarily allow console.log for this experiment
    console.info(message);
}

function logError(message: string, error: unknown): void {
    // biome-ignore lint/suspicious/noConsole: Temporarily allow console.error for this experiment
    console.error(message, error);
}

interface GenerateArgs {
    api?: string;
    group?: string;
    version?: string;
    watch?: boolean;
}

async function runGenerateOnce(args: GenerateArgs): Promise<void> {
    const { api, group, version } = args;
    if (group == null) {
        throw new Error("The --group option is required.");
    }

    await generateSwiftSdk({
        api,
        group,
        version
    });
}

function startWatch(args: GenerateArgs): void {
    const fernDir = path.join(process.cwd(), "fern");
    if (!fs.existsSync(fernDir)) {
        logInfo('[swift-sdk-runner] No "fern" directory found in current working directory, nothing to watch.');
        return;
    }

    // Basic debounce to avoid triggering too frequently on rapid file writes.
    let pending = false;
    let running = false;

    const scheduleRun = () => {
        pending = true;
        if (running) {
            return;
        }
        void (async () => {
            while (pending) {
                pending = false;
                running = true;
                try {
                    logInfo("[swift-sdk-runner] Detected changes. Regenerating Swift SDK...");
                    await runGenerateOnce(args);
                    logInfo("[swift-sdk-runner] Swift SDK generation completed.");
                } catch (error) {
                    logError("[swift-sdk-runner] Error during SDK generation:", error);
                } finally {
                    running = false;
                }
            }
        })();
    };

    fs.watch(
        fernDir,
        {
            recursive: true
        },
        (_eventType, filename) => {
            if (!filename) {
                return;
            }
            if (!filename.endsWith(".yml") && !filename.endsWith(".yaml")) {
                return;
            }
            scheduleRun();
        }
    );

    logInfo('[swift-sdk-runner] Watching "fern" directory for YAML changes. Press Ctrl+C to stop.');
}

const cli = yargs(hideBin(process.argv)).exitProcess(false);

cli.command(
    "generate",
    "Generate the Swift SDK for the API.",
    (y) =>
        y
            .option("api", {
                type: "string",
                description: "The API to generate.",
                demandOption: false
            })
            .option("group", {
                type: "string",
                description: "The group to generate.",
                demandOption: true
            })
            .option("version", {
                type: "string",
                description: "The version to use for the output.",
                demandOption: false
            })
            .option("watch", {
                type: "boolean",
                description: "Watch Fern definition files and regenerate on changes.",
                default: false
            }),
    async (args) => {
        const { watch, ...rest } = args as unknown as GenerateArgs;

        if (watch) {
            await runGenerateOnce(rest);
            startWatch(rest);
            // Keep the process alive while watching for changes.
            await new Promise<never>(() => {
                // never resolves
            });
        } else {
            await runGenerateOnce(rest);
        }
    }
)
    .demandCommand(1)
    .help()
    .parse();
