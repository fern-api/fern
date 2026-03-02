import { type AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import fs from "fs";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { githubRelease } from "./api/github-release.js";
import {
    formatBootstrapSummary,
    generateReadmeToStream,
    generateReferenceToStream,
    githubPr,
    githubPush,
    replayInit
} from "./api.js";
import { loadGitHubConfig } from "./configuration/loadGitHubConfig.js";
import { loadReadmeConfig } from "./configuration/loadReadmeConfig.js";
import { loadReferenceConfig } from "./configuration/loadReferenceConfig.js";
import { type PipelineConfig, PostGenerationPipeline } from "./pipeline/index.js";

const STDIN_MARKER = "-";

void yargs(hideBin(process.argv))
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    .scriptName(process.env.CLI_NAME ?? "generator-cli")
    .strict()
    .command(
        "generate readme",
        "Generate a README.md using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true
                })
                .option("original-readme", {
                    string: true,
                    required: false
                })
                .option("output", {
                    string: true,
                    required: false
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const readmeConfig = await loadReadmeConfig({
                absolutePathToConfig: resolve(wd, argv.config)
            });
            const originalReadmeContent =
                argv.originalReadme != null ? await readFile(argv.originalReadme, "utf8") : undefined;
            await generateReadmeToStream({
                originalReadmeContent,
                readmeConfig,
                outputStream: await createWriteStream(argv.output)
            });
            process.exit(0);
        }
    )
    .command(
        "generate-reference",
        "Generate an SDK reference (`reference.md`) using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true
                })
                .option("output", {
                    string: true,
                    required: false
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const referenceConfig = await loadReferenceConfig({
                absolutePathToConfig: resolve(wd, argv.config)
            });
            await generateReferenceToStream({
                referenceConfig,
                outputStream: await createWriteStream(argv.output)
            });
            process.exit(0);
        }
    )
    .command("github", "GitHub operations", (yargs) => {
        return yargs
            .command(
                "push",
                "Push changes to GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        process.exit(1);
                    }
                    const wd = cwd();
                    const githubConfig = await loadGitHubConfig({
                        absolutePathToConfig: resolve(wd, argv.config)
                    });
                    await githubPush({ githubConfig });
                    process.exit(0);
                }
            )
            .command(
                "pr",
                "Create a pull request on GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        process.exit(1);
                    }
                    const wd = cwd();
                    const githubConfig = await loadGitHubConfig({
                        absolutePathToConfig: resolve(wd, argv.config)
                    });
                    await githubPr({ githubConfig });
                    // Implementation for github pr command
                    process.stderr.write(`Creating PR on GitHub with config: ${resolve(wd, argv.config)}\n`);
                    process.exit(0);
                }
            )
            .command(
                "release",
                "Create a release on GitHub",
                (subYargs) => {
                    return subYargs.option("config", {
                        string: true,
                        required: true,
                        description: "Path to configuration file"
                    });
                },
                async (argv) => {
                    if (argv.config == null) {
                        process.stderr.write("missing required arguments; please specify the --config flag\n");
                        process.exit(1);
                    }
                    const wd = cwd();
                    const githubConfig = await loadGitHubConfig({
                        absolutePathToConfig: resolve(wd, argv.config)
                    });
                    await githubRelease({ githubConfig });
                    process.exit(0);
                }
            )
            .demandCommand();
    })
    .command("pipeline", "Post-generation pipeline operations", (yargs) => {
        return yargs
            .command(
                "run",
                "Run the post-generation pipeline",
                (subYargs) => {
                    return subYargs
                        .option("config", {
                            string: true,
                            required: true,
                            description: "The file or data to use for pipeline configuration"
                        })
                        .option("output-dir", {
                            string: true,
                            required: true,
                            description: "Path to SDK output directory"
                        });
                },
                async (argv) => {
                    if (argv.config == null || argv["output-dir"] == null) {
                        process.stderr.write(
                            "missing required arguments; please specify --config and --output-dir flags\n"
                        );
                        process.exit(1);
                    }

                    try {
                        const wd = cwd();

                        // Read pipeline config: "-" = stdin, starts with "{" = inline JSON, otherwise file path
                        const configValue = argv.config;
                        const configContent =
                            configValue === STDIN_MARKER
                                ? await readStdin()
                                : configValue.trimStart().startsWith("{")
                                  ? configValue
                                  : await readFile(resolve(wd, configValue), "utf-8");
                        let config: PipelineConfig;
                        try {
                            config = JSON.parse(configContent);
                        } catch (parseError) {
                            const parseMessage = parseError instanceof Error ? parseError.message : String(parseError);
                            throw new Error(`Failed to parse pipeline config as JSON: ${parseMessage}`);
                        }

                        // Override outputDir from CLI arg
                        config.outputDir = resolve(wd, argv["output-dir"]);

                        // Run pipeline
                        const pipeline = new PostGenerationPipeline(config);
                        const result = await pipeline.run();

                        // Log summary to stderr
                        process.stderr.write(`Pipeline ${result.success ? "succeeded" : "failed"}\n`);

                        if (result.steps.replay != null) {
                            const replayResult = result.steps.replay;
                            process.stderr.write(
                                `Replay: ${replayResult.patchesApplied} patches applied (${replayResult.patchesWithConflicts} conflicts)\n`
                            );
                        }

                        if (result.steps.github != null) {
                            const githubResult = result.steps.github;
                            if (githubResult.prUrl != null) {
                                const action = githubResult.updatedExistingPr ? "Updated" : "Created";
                                process.stderr.write(`GitHub: ${action} PR: ${githubResult.prUrl}\n`);
                            } else if (githubResult.branchUrl != null) {
                                process.stderr.write(`GitHub: Pushed to ${githubResult.branchUrl}\n`);
                            }
                        }

                        if (result.errors != null && result.errors.length > 0) {
                            process.stderr.write(`Errors:\n${result.errors.map((e) => `  - ${e}`).join("\n")}\n`);
                        }

                        // Write result JSON to stdout for programmatic consumption
                        process.stdout.write(JSON.stringify(result) + "\n");

                        // Use process.exitCode instead of process.exit() to allow stdout to drain
                        process.exitCode = result.success ? 0 : 1;
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        process.stderr.write(`Pipeline failed: ${errorMessage}\n`);
                        process.exitCode = 1;
                    }
                }
            )
            .demandCommand();
    })
    .command({
        command: "replay",
        describe: false,
        builder: (yargs) => {
            return yargs
                .command(
                    "init",
                    false, // hidden from --help
                    (subYargs) => {
                        return subYargs
                            .option("github", {
                                type: "string",
                                required: true,
                                description: "GitHub repository (e.g., owner/repo)"
                            })
                            .option("token", {
                                type: "string",
                                required: true,
                                description: "GitHub token with push and PR permissions"
                            })
                            .option("dry-run", {
                                type: "boolean",
                                default: false,
                                description: "Report what would happen without creating a PR"
                            })
                            .option("max-commits", {
                                type: "number",
                                description: "Max commits to scan for generation history"
                            })
                            .option("pr-title", {
                                type: "string",
                                description: "Custom title for the PR"
                            })
                            .option("pr-body", {
                                type: "string",
                                description: "Custom body for the PR"
                            })
                            .option("force", {
                                type: "boolean",
                                default: false,
                                description: "Overwrite existing lockfile if Replay is already initialized"
                            })
                            .option("import-history", {
                                type: "boolean",
                                default: false,
                                description: "Scan git history for existing patches (migration)"
                            });
                    },
                    async (argv) => {
                        if (argv.github == null || argv.token == null) {
                            process.stderr.write(
                                "missing required arguments; please specify --github and --token flags\n"
                            );
                            process.exit(1);
                        }

                        try {
                            const result = await replayInit({
                                githubRepo: argv.github,
                                token: argv.token,
                                dryRun: argv["dry-run"],
                                maxCommitsToScan: argv["max-commits"],
                                prTitle: argv["pr-title"],
                                prBody: argv["pr-body"],
                                force: argv.force,
                                importHistory: argv["import-history"]
                            });

                            const logEntries = formatBootstrapSummary(result);
                            for (const entry of logEntries) {
                                process.stderr.write(`${entry.message}\n`);
                            }

                            if (!result.bootstrap.generationCommit) {
                                process.exit(1);
                            }

                            if (argv["dry-run"]) {
                                process.stderr.write("\nDry run complete. No PR created.\n");
                            }

                            // Write result as JSON to stdout for programmatic consumption
                            process.stdout.write(JSON.stringify(result, null, 2) + "\n");
                            process.exit(0);
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            process.stderr.write(`Replay init failed: ${errorMessage}\n`);
                            process.exit(1);
                        }
                    }
                )
                .command(
                    "bootstrap <sdk-dir>",
                    false, // hidden from --help
                    (subYargs) => {
                        return subYargs
                            .positional("sdk-dir", {
                                type: "string",
                                description: "Path to the SDK output directory",
                                demandOption: true
                            })
                            .option("dry-run", {
                                type: "boolean",
                                default: false,
                                description: "Show what would happen without making changes"
                            })
                            .option("fernignore-action", {
                                type: "string",
                                choices: ["migrate", "delete", "skip"],
                                default: "skip",
                                description: "How to handle .fernignore: migrate, delete, or skip"
                            })
                            .option("import-history", {
                                type: "boolean",
                                default: false,
                                description: "Scan git history for existing patches (migration)"
                            });
                    },
                    async (argv) => {
                        const sdkDir = argv["sdk-dir"];
                        if (sdkDir == null) {
                            process.stderr.write("Missing required argument: sdk-dir\n");
                            process.exit(1);
                        }

                        try {
                            const { bootstrap } = await import("@fern-api/replay");
                            const outputDir = resolve(cwd(), sdkDir);
                            const fernignoreAction = argv["fernignore-action"] as
                                | "migrate"
                                | "delete"
                                | "skip"
                                | undefined;
                            const result = await bootstrap(outputDir, {
                                dryRun: argv["dry-run"],
                                fernignoreAction,
                                importHistory: argv["import-history"]
                            });

                            if (result.generationCommit) {
                                process.stderr.write(
                                    `Found generation commit: ${result.generationCommit.sha.slice(0, 7)} "${result.generationCommit.message}"\n`
                                );
                                process.stderr.write(
                                    `Scanned commits since: ${result.scannedSinceGeneration.slice(0, 7)} (last generation)\n`
                                );
                                if (result.staleGenerationsSkipped > 0) {
                                    process.stderr.write(
                                        `Skipped ${result.staleGenerationsSkipped} older generation(s) — only tracking recent commits\n`
                                    );
                                }
                            }

                            process.stderr.write(
                                `Patches detected: ${result.patchesDetected}, created: ${result.patchesCreated}\n`
                            );

                            if (result.warnings && result.warnings.length > 0) {
                                for (const warning of result.warnings) {
                                    process.stderr.write(`Warning: ${warning}\n`);
                                }
                            }

                            if (argv["dry-run"]) {
                                process.stderr.write("\nDry run complete. No changes made.\n");
                            } else {
                                process.stderr.write(
                                    `\nBootstrap complete! Lockfile saved to ${outputDir}/.fern/replay.lock\n`
                                );
                            }

                            process.exit(0);
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            process.stderr.write(`Bootstrap failed: ${errorMessage}\n`);
                            process.exit(1);
                        }
                    }
                )
                .demandCommand();
        },
        handler: () => {
            // parent command — subcommands handle execution
        }
    })
    .demandCommand()
    .showHelpOnFail(true)
    .parse();

async function readStdin(): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

async function createWriteStream(outputPath: string | undefined): Promise<fs.WriteStream | NodeJS.Process["stdout"]> {
    return outputPath != null ? await createWriteStreamFromFile(resolve(cwd(), outputPath)) : process.stdout;
}

async function createWriteStreamFromFile(filepath: AbsoluteFilePath): Promise<fs.WriteStream> {
    if (!(await doesPathExist(filepath))) {
        await mkdir(path.dirname(filepath), { recursive: true });
    }
    return fs.createWriteStream(filepath);
}
