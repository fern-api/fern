import { schemas } from "@fern-api/config";
import { getFiddleOrigin } from "@fern-api/core";
import { extractErrorMessage, replaceEnvVariables } from "@fern-api/core-utils";
import { formatBootstrapSummary, ReplaySubmitError, replayInit, submitReplayInit } from "@fern-api/generator-cli";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace InitCommand {
    export interface Args extends GlobalArgs {
        group?: string;
        api?: string;
        github?: string;
        token?: string;
        "dry-run": boolean;
        "max-commits"?: number;
        force: boolean;
    }
}

export class InitCommand {
    public async handle(context: Context, args: InitCommand.Args): Promise<void> {
        let githubRepo: string | undefined = args.github;
        let token: string | undefined = args.token;

        if (args.group != null) {
            const resolved = await this.resolveGroupGithubConfig(context, args.group, args.api);
            githubRepo = githubRepo ?? resolved.githubRepo;
            token = token ?? resolved.token;
        }

        if (githubRepo == null) {
            throw new CliError({
                message:
                    "Missing required github config. Either use --group to read from fern.yml, or provide --github directly.",
                code: CliError.Code.ConfigError
            });
        }

        if (token == null) {
            context.stderr.warn(
                "No GitHub token found. Clone may fail for private repos. Set GITHUB_TOKEN or pass --token."
            );
        }

        context.stderr.info(`Initializing Replay for: ${githubRepo}`);
        if (args["dry-run"]) {
            context.stderr.info("(dry-run mode)");
        }

        try {
            const result = await replayInit({
                githubRepo,
                token,
                dryRun: args["dry-run"],
                maxCommitsToScan: args["max-commits"],
                force: args.force
            });

            const logEntries = formatBootstrapSummary(result);
            for (const entry of logEntries) {
                if (entry.level === "warn") {
                    context.stderr.warn(entry.message);
                } else {
                    context.stderr.info(entry.message);
                }
            }

            if (!result.bootstrap.generationCommit) {
                return;
            }

            if (args["dry-run"]) {
                context.stderr.info("\nDry run complete. No changes made.");
                return;
            }

            if (result.lockfileContent == null) {
                throw new CliError({
                    message: "Bootstrap succeeded but lockfile content is missing.",
                    code: CliError.Code.InternalError
                });
            }

            const fernToken = await context.getTokenOrPrompt();

            try {
                const { prUrl } = await submitReplayInit({
                    fiddleOrigin: getFiddleOrigin(),
                    fernToken: fernToken.value,
                    githubRepo,
                    initResult: result
                });
                context.stderr.info(`\n${Icons.success} PR created: ${chalk.underline(prUrl)}`);
                context.stderr.info("Merge the PR to enable Replay for this repository.");
            } catch (submitError) {
                if (submitError instanceof ReplaySubmitError) {
                    throw new CliError({
                        message: submitError.message,
                        code: submitError.statusCode === 404 ? CliError.Code.ConfigError : CliError.Code.NetworkError
                    });
                }
                throw submitError;
            }
        } catch (error) {
            if (error instanceof CliError) {
                throw error;
            }
            throw new CliError({
                message: `Failed to initialize Replay: ${extractErrorMessage(error)}`,
                code: CliError.Code.NetworkError
            });
        }
    }

    private async resolveGroupGithubConfig(
        context: Context,
        groupName: string,
        _api: string | undefined
    ): Promise<{ githubRepo: string; token: string | undefined }> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.sdks == null) {
            throw new CliError({
                message: "No SDK targets found in fern.yml.",
                code: CliError.Code.ConfigError
            });
        }

        const matchingTargets = workspace.sdks.targets.filter((t) => t.groups != null && t.groups.includes(groupName));

        if (matchingTargets.length === 0) {
            const availableGroups = new Set<string>();
            for (const target of workspace.sdks.targets) {
                for (const g of target.groups ?? []) {
                    availableGroups.add(g);
                }
            }
            throw new CliError({
                message: `Group "${groupName}" not found. Available groups: ${[...availableGroups].join(", ")}`,
                code: CliError.Code.ConfigError
            });
        }

        for (const target of matchingTargets) {
            const git = target.output.git;
            if (git == null) {
                continue;
            }

            if (schemas.isGitOutputSelfHosted(git)) {
                context.stderr.info(`Using github config from group "${groupName}" target "${target.name}"`);
                const resolvedGit = replaceEnvVariables(git, {
                    onError: (message) => {
                        throw new CliError({
                            message: message ?? "Failed to resolve env variable",
                            code: CliError.Code.ConfigError
                        });
                    }
                });
                return { githubRepo: resolvedGit.uri, token: resolvedGit.token };
            }

            if (schemas.isGitOutputGitHubRepository(git)) {
                const envToken = process.env.GITHUB_TOKEN;
                context.stderr.info(
                    `Using repository config from group "${groupName}" target "${target.name}"` +
                        (envToken != null ? ". Using GITHUB_TOKEN from environment." : ".")
                );
                return { githubRepo: git.repository, token: envToken };
            }
        }

        throw new CliError({
            message: `No target in group "${groupName}" has a git output configuration.`,
            code: CliError.Code.ConfigError
        });
    }
}

export function addInitCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new InitCommand();
    command(
        cli,
        "init",
        "Initialize Replay for an SDK repository",
        (context, args) => cmd.handle(context, args as InitCommand.Args),
        (yargs) =>
            yargs
                .option("group", {
                    type: "string",
                    description: "Generator group from fern.yml (reads git config automatically)"
                })
                .option("api", {
                    type: "string",
                    description: "If multiple APIs, specify which API workspace to use"
                })
                .option("github", {
                    type: "string",
                    description: "GitHub repository (e.g., owner/repo). Overrides --group config."
                })
                .option("token", {
                    type: "string",
                    description: "GitHub token. Overrides --group config."
                })
                .option("dry-run", {
                    type: "boolean",
                    default: false,
                    description: "Report what would happen without making changes"
                })
                .option("max-commits", {
                    type: "number",
                    description: "Max commits to scan for generation history"
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Overwrite existing lockfile if Replay is already initialized"
                })
    );
}
