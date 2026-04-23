import { schemas } from "@fern-api/config";
import type { Audiences } from "@fern-api/configuration";
import type { ContainerRunner } from "@fern-api/core-utils";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { ValidationIssue } from "@fern-api/yaml-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import inquirer from "inquirer";
import yaml from "js-yaml";
import type { Argv } from "yargs";
import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import type { ApiDefinition } from "../../../api/config/ApiDefinition.js";
import { ApiSpecResolver } from "../../../api/resolver/ApiSpecResolver.js";
import { GENERATE_COMMAND_TIMEOUT_MS } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { SourcedValidationError } from "../../../errors/SourcedValidationError.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { LANGUAGES, type Language } from "../../../sdk/config/Language.js";
import type { Target } from "../../../sdk/config/Target.js";
import { GeneratorPipeline } from "../../../sdk/generator/GeneratorPipeline.js";
import { SdkStageOverrides, SdkTaskGroup } from "../../../sdk/task/SdkTaskGroup.js";
import { promptSelect } from "../../../ui/promptSelect.js";
import type { TaskStageLabels } from "../../../ui/TaskStageLabels.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { WorkspaceBuilder } from "../../../workspace/WorkspaceBuilder.js";
import { command } from "../../_internal/command.js";
import { isGitUrl } from "../utils/gitUrl.js";

export declare namespace GenerateCommand {
    export interface Args extends GlobalArgs {
        /** Path or URL to an API spec file (enables no-config mode) */
        api?: string;

        /** Filter by audiences */
        audience?: string[];

        /** Container engine to use for local generation */
        "container-engine"?: ContainerRunner;

        /** Force generation without prompts */
        force: boolean;

        /** Generator group to run (from fern.yml) */
        group?: string;

        /** Whether to keep containers after completion */
        "keep-container": boolean;

        /** Whether to run the generator locally in a container */
        local: boolean;

        /** Organization name (required in no-config mode) */
        org?: string;

        /** Output directory or git URL */
        output?: string;

        /** Override the version for generated packages */
        "output-version"?: string;

        /** The SDK target to generate */
        target?: string;

        /** Override the generator version for the target */
        "target-version"?: string;

        /** Preview mode */
        preview: boolean;

        /** Path to .fernignore file */
        fernignore?: string;

        /** Ignore the .fernignore file and generate all files */
        "skip-fernignore": boolean;

        /** Require all referenced environment variables to be defined */
        "require-env-vars": boolean;
    }
}

export class GenerateCommand {
    public async handle(context: Context, args: GenerateCommand.Args): Promise<void> {
        const result = await context.loadWorkspace();
        if (result == null) {
            return this.handleWithFlags(context, args);
        }
        if (!result.success) {
            throw new SourcedValidationError(result.issues);
        }
        return this.handleWithWorkspace(context, result.workspace, args);
    }

    private async handleWithWorkspace(
        context: Context,
        workspace: Workspace,
        args: GenerateCommand.Args
    ): Promise<void> {
        let workspaceWithOverrides = workspace;

        if (args.api != null) {
            const resolver = new ApiSpecResolver({ context });
            const resolvedSpec = await resolver.resolve({ reference: args.api });

            const overriddenApis: Record<string, ApiDefinition> = {};
            for (const apiName of Object.keys(workspaceWithOverrides.apis)) {
                overriddenApis[apiName] = { specs: [resolvedSpec.spec] };
            }

            workspaceWithOverrides = { ...workspaceWithOverrides, apis: overriddenApis };
        }

        if (args.org != null) {
            workspaceWithOverrides = {
                ...workspaceWithOverrides,
                org: args.org
            };
        }

        const targets = await this.getTargets({
            context,
            workspace: workspaceWithOverrides,
            args,
            groupName: args.target != null ? undefined : (args.group ?? workspaceWithOverrides.sdks?.defaultGroup)
        });

        this.validateArgs({ workspace: workspaceWithOverrides, args, targets });

        await this.runGeneration({ context, workspace: workspaceWithOverrides, targets, args, forceLocal: false });
    }

    private async handleWithFlags(context: Context, args: GenerateCommand.Args): Promise<void> {
        const missingFlags: string[] = [];
        if (args.api == null) {
            missingFlags.push("--api <path|url>      Path or URL to an API spec file (e.g. ./openapi.yaml)");
        }
        if (args.target == null) {
            missingFlags.push("--target <language>    The SDK language to generate (e.g. typescript)");
        }
        if (args.org == null) {
            missingFlags.push("--org <name>           Your organization name (e.g. acme)");
        }
        if (args.output == null) {
            missingFlags.push("--output <path|url>    Output path or git URL (e.g. ./my-sdk)");
        }
        if (args.group != null) {
            missingFlags.push("remove --group         Groups are not supported without a fern.yml");
        }
        if (missingFlags.length > 0) {
            throw new CliError({
                message:
                    `No fern.yml found, either run 'fern init' or specify all of the required flags:\n\n` +
                    missingFlags.map((flag) => `  ${flag}`).join("\n"),
                code: CliError.Code.ConfigError
            });
        }

        // All four are guaranteed to be defined after the missingFlags check above.
        if (args.api == null || args.target == null || args.org == null || args.output == null) {
            throw new CliError({
                message: "Internal error: required flags missing",
                code: CliError.Code.InternalError
            });
        }
        const { api, target, org, output } = args;

        const resolver = new ApiSpecResolver({ context });
        const resolvedSpec = await resolver.resolve({
            reference: api
        });

        const workspaceBuilder = new WorkspaceBuilder({ context });
        const workspace = await workspaceBuilder.build({
            org,
            lang: this.resolveLanguage(target),
            resolvedSpec,
            output: this.parseTargetOutput({ ...args, output }),
            targetVersion: args["target-version"]
        });

        const targets = workspace.sdks?.targets ?? [];
        await this.runGeneration({ context, workspace, targets, args, forceLocal: true });
    }

    private async runGeneration({
        context,
        workspace,
        targets,
        args,
        forceLocal
    }: {
        context: Context;
        workspace: Workspace;
        targets: Target[];
        args: GenerateCommand.Args;
        forceLocal: boolean;
    }): Promise<void> {
        if (workspace.sdks == null) {
            throw new CliError({ message: "No SDKs configured", code: CliError.Code.InternalError });
        }

        // Check that the APIs referenced by each target are valid.
        const apisToCheck = [...new Set(targets.map((t) => t.api))];
        const apiChecker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });
        const checkResult = await apiChecker.check({
            workspace,
            apiNames: apisToCheck
        });
        if (checkResult.violations.length > 0) {
            for (const v of checkResult.violations) {
                process.stderr.write(
                    `${chalk.red(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`
                );
            }
        }

        // Check that the SDK configurations are valid (when fern.yml exists).
        if (workspace.fernYml != null) {
            const sdkChecker = new SdkChecker({ context });
            const sdkCheckResult = await sdkChecker.check({ workspace });
            if (sdkCheckResult.violations.length > 0) {
                for (const v of sdkCheckResult.violations) {
                    process.stderr.write(
                        `${chalk.red(`${v.displayRelativeFilepath}:${v.line}:${v.column}: ${v.message}`)}\n`
                    );
                }
            }
            if (sdkCheckResult.errorCount > 0) {
                throw new CliError({ code: CliError.Code.ValidationError });
            }
        }

        const validTargets = targets.filter((t) => checkResult.validApis.has(t.api));
        if (validTargets.length === 0) {
            throw new CliError({ code: CliError.Code.ValidationError });
        }

        const pipeline = new GeneratorPipeline({
            context,
            cliVersion: workspace.cliVersion
        });

        const isLocal = forceLocal || args.local;

        const token = this.isTokenRequired({ targets, args: { ...args, local: isLocal } })
            ? await context.getTokenOrPrompt()
            : undefined;

        if (token != null) {
            await context.verifyOrgAccess({ organization: workspace.sdks.org, token });
        }

        const runtime = isLocal ? "local" : "remote";

        const taskGroup = new SdkTaskGroup({ context });
        for (const target of targets) {
            const stageOverrides: SdkStageOverrides | undefined =
                target.output.git != null && target.output.path == null
                    ? {
                          output: this.getGitOutputStageLabels(target.output.git.mode ?? "pr")
                      }
                    : undefined;

            taskGroup.addTask({
                id: target.name,
                name: target.name,
                stageOverrides
            });
        }

        // Check output directories before starting the task UI.
        for (const target of targets) {
            const outputPath =
                args.output != null
                    ? resolve(context.cwd, args.output)
                    : context.resolveOutputFilePath(target.output.path);

            if (outputPath != null) {
                const { shouldProceed } = await this.checkOutputDirectory({ context, args, outputPath });
                if (!shouldProceed) {
                    throw new CliError({ message: "Generation cancelled.", code: CliError.Code.ConfigError });
                }
            }
        }

        const sdkInitialism = this.maybePluralSdks(targets);

        await taskGroup.start({
            title: `Generating ${sdkInitialism}`,
            subtitle: `org: ${workspace.sdks.org}`
        });

        context.onShutdown(() => {
            taskGroup.finish({
                successMessage: `Successfully generated ${sdkInitialism}`,
                errorMessage: `Generation interrupted`
            });
        });

        await Promise.all(
            targets.map(async (target) => {
                const task = taskGroup.getTask(target.name);
                if (task == null) {
                    // This should be unreachable.
                    throw new CliError({
                        message: `Internal error; task '${target.name}' not found`,
                        code: CliError.Code.InternalError
                    });
                }

                task.start();

                task.stage.validation.start();
                const apiDefinition = workspace.apis[target.api];
                if (apiDefinition == null) {
                    task.stage.validation.fail(`API not found in workspace`);
                    return;
                }
                if (checkResult.invalidApis.has(target.api)) {
                    task.stage.validation.fail(`API is invalid`);
                    return;
                }
                task.stage.validation.complete();

                task.stage.generator.start();
                const pipelineResult = await pipeline.run({
                    organization: workspace.org,
                    ai: workspace.ai,
                    target,
                    apiDefinition,
                    task: task.getTask(),
                    audiences: this.parseAudiences(args.audience),
                    runtime,
                    containerEngine: args["container-engine"] ?? "docker",
                    keepContainer: args["keep-container"],
                    preview: args.preview,
                    outputPath: args.output != null ? resolve(context.cwd, args.output) : undefined,
                    token,
                    version: args["output-version"],
                    fernignorePath: args.fernignore,
                    skipFernignore: args["skip-fernignore"],
                    requireEnvVars: args["require-env-vars"]
                });
                if (!pipelineResult.success) {
                    task.stage.generator.fail(pipelineResult.error);
                    return;
                }
                task.stage.generator.complete();
                task.stage.output.complete();
                task.complete(pipelineResult.output);
            })
        );

        const summary = taskGroup.finish({
            successMessage: `Successfully generated ${sdkInitialism}`,
            errorMessage: `Failed to generate ${sdkInitialism}`
        });

        if (summary.failedCount > 0) {
            throw new CliError({ code: CliError.Code.ContainerError });
        }
    }

    private validateArgs({
        workspace,
        args,
        targets
    }: {
        workspace: Workspace;
        args: GenerateCommand.Args;
        targets: Target[];
    }): void {
        if (args["container-engine"] != null && !args.local) {
            throw new CliError({
                message: "The --container-engine flag can only be used with --local",
                code: CliError.Code.ConfigError
            });
        }
        if (args.group != null && args.target != null) {
            throw new CliError({
                message: "The --group and --target flags cannot be used together",
                code: CliError.Code.ConfigError
            });
        }
        if (targets.length > 1 && args.output != null) {
            throw new CliError({
                message: "The --output flag can only be used when generating a single target",
                code: CliError.Code.ConfigError
            });
        }
        if (args["skip-fernignore"] && args.fernignore != null) {
            throw new CliError({
                message: "The --skip-fernignore and --fernignore flags cannot be used together.",
                code: CliError.Code.ConfigError
            });
        }
        const issues: ValidationIssue[] = [];
        if (args.local) {
            for (const target of targets) {
                const git = target.output.git;
                if (git != null && !schemas.isGitOutputSelfHosted(git) && target.output.path == null) {
                    issues.push(this.suggestGitHubRepositoryOutput({ target, git }));
                }
            }
        }
        if (issues.length > 0) {
            throw new SourcedValidationError(issues);
        }
    }

    private suggestGitHubRepositoryOutput({
        target,
        git
    }: {
        target: Target;
        git: schemas.GitHubRepositoryOutputSchema;
    }): ValidationIssue {
        const { repository, reviewers: _reviewers, ...rest } = git;
        const uri =
            repository.startsWith("https://") || repository.startsWith("http://")
                ? repository
                : `https://github.com/${repository}`;
        const suggestedTarget = {
            [target.name]: {
                output: {
                    git: {
                        ...rest,
                        uri,
                        token: "${GIT_TOKEN}"
                    }
                }
            }
        };
        return new ValidationIssue({
            message: `Target '${target.name}' is incompatible with --local mode.`,
            suggestion:
                `Use remote generation (without --local) or configure the target with 'uri' and 'token' instead of 'repository'.\n\n` +
                `Example:\n` +
                this.indentBlock(yaml.dump(suggestedTarget, { lineWidth: -1 })),
            location: target.sourceLocation
        });
    }

    /**
     * Parses the --output argument into an OutputSchema.
     *
     * - Git URLs (ending in .git, or starting with https://github.com/, https://gitlab.com/, git@)
     *   produce a self-hosted git output with token from GITHUB_TOKEN or GIT_TOKEN env vars.
     * - Anything else is treated as a local path.
     */
    private parseTargetOutput(args: GenerateCommand.Args): schemas.OutputObjectSchema {
        if (args.output != null && isGitUrl(args.output)) {
            if (!args.local) {
                throw new CliError({
                    message:
                        `Remote generation is not supported with a git URL for --output\n\n` +
                        `  Use --local or specify a local filesystem path for --output`,
                    code: CliError.Code.ConfigError
                });
            }
            const token = process.env.GITHUB_TOKEN ?? process.env.GIT_TOKEN;
            if (token == null) {
                throw new CliError({
                    message:
                        `A git token is required when --output is a git URL.\n\n` +
                        `  Set GITHUB_TOKEN or GIT_TOKEN:\n` +
                        `    export GITHUB_TOKEN=ghp_xxx\n\n` +
                        `  Or use a local path:\n` +
                        `    --output ./my-sdk`,
                    code: CliError.Code.AuthError
                });
            }
            return {
                git: {
                    uri: args.output,
                    token,
                    mode: "pr"
                }
            };
        }

        return { path: args.output };
    }

    private async getTargets({
        context,
        workspace,
        args,
        groupName
    }: {
        context: Context;
        workspace: Workspace;
        args: GenerateCommand.Args;
        groupName: string | undefined;
    }): Promise<Target[]> {
        let matched = workspace.sdks != null ? this.filterTargetsByGroup(workspace.sdks.targets, groupName) : [];
        if (args.target != null) {
            matched = matched.filter((t) => t.name === args.target);
            if (matched.length === 0) {
                const allTargets = workspace.sdks?.targets ?? [];
                const available = allTargets.map((t) => t.name);
                if (available.length > 0) {
                    throw new CliError({
                        message: `Target '${args.target}' not found. Available targets: ${available.join(", ")}`,
                        code: CliError.Code.ConfigError
                    });
                } else {
                    throw new CliError({
                        message: `Target '${args.target}' not found`,
                        code: CliError.Code.ConfigError
                    });
                }
            }
        }
        if (matched.length === 0) {
            if (groupName != null) {
                throw new CliError({
                    message: `No targets found for group '${groupName}'`,
                    code: CliError.Code.ConfigError
                });
            }
            throw new CliError({
                message: "No targets configured in fern.yml",
                code: CliError.Code.ConfigError
            });
        }

        // When multiple targets exist and no group/target was specified, prompt for selection.
        // Prefer group-based selection when groups are defined; fall back to target selection otherwise.
        if (groupName == null && args.target == null && matched.length > 1) {
            const allGroups = this.collectGroups(matched);
            if (allGroups.length > 1) {
                // Multiple groups defined — prompt by group.
                // Use undefined as the "all" sentinel to avoid any collision with real group names.
                const selectedGroup = await promptSelect<string | undefined>({
                    isTTY: context.isTTY,
                    message: "Multiple SDK groups found. Select one:",
                    choices: [
                        { name: `all (${matched.length} targets)`, value: undefined },
                        ...allGroups.map((g) => ({ name: g, value: g }))
                    ],
                    nonInteractiveError: `Multiple SDK groups found: ${allGroups.join(", ")}. Use --group to select one.`,
                    flagHint: (value) => (value != null ? `--group ${value}` : undefined)
                });
                if (selectedGroup != null) {
                    matched = this.filterTargetsByGroup(matched, selectedGroup);
                }
            } else {
                // No groups defined — prompt by target name.
                // Use undefined as the "all" sentinel to avoid any collision with real target names.
                const targetNames = matched.map((t) => t.name);
                const selectedTarget = await promptSelect<string | undefined>({
                    isTTY: context.isTTY,
                    message: "Multiple SDK targets found. Select one:",
                    choices: [
                        { name: `all (${matched.length} targets)`, value: undefined },
                        ...targetNames.map((name) => ({ name, value: name }))
                    ],
                    nonInteractiveError: `Multiple SDK targets found: ${targetNames.join(", ")}. Use --target to select one.`,
                    flagHint: (value) => (value != null ? `--target ${value}` : undefined)
                });
                if (selectedTarget != null) {
                    matched = matched.filter((t) => t.name === selectedTarget);
                }
            }
        }

        return matched.map((target) => ({
            ...target,
            version: args["target-version"] ?? target.version,
            output: args.output != null ? this.parseTargetOutput(args) : target.output
        }));
    }

    private collectGroups(targets: Target[]): string[] {
        const groups = new Set<string>();
        for (const target of targets) {
            if (target.groups != null) {
                for (const group of target.groups) {
                    groups.add(group);
                }
            }
        }
        return [...groups].sort();
    }

    private async checkOutputDirectory({
        context,
        args,
        outputPath
    }: {
        context: Context;
        args: GenerateCommand.Args;
        outputPath: AbsoluteFilePath;
    }): Promise<{ shouldProceed: boolean }> {
        if (args.force || !context.isTTY) {
            return { shouldProceed: true };
        }
        const exists = await doesPathExist(outputPath);
        if (!exists) {
            return { shouldProceed: true };
        }
        const files = await readdir(outputPath);
        if (files.length === 0) {
            return { shouldProceed: true };
        }
        const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: "confirm",
                name: "confirm",
                message: `Directory ${outputPath} contains existing files that may be overwritten. Continue?`,
                default: false
            }
        ]);
        return { shouldProceed: confirm };
    }

    private filterTargetsByGroup(targets: Target[], groupName: string | undefined): Target[] {
        if (groupName == null) {
            return targets;
        }
        return targets.filter((target) => target.groups?.includes(groupName));
    }

    private resolveLanguage(target: string): Language {
        if (isLanguage(target)) {
            return target;
        }
        throw new CliError({
            message: `"${target}" is not a supported language. Supported: ${LANGUAGES.join(", ")}`,
            code: CliError.Code.ConfigError
        });
    }

    private parseAudiences(audiences: string[] | undefined): Audiences | undefined {
        if (audiences == null || audiences.length === 0) {
            return undefined;
        }
        return {
            type: "select",
            audiences
        };
    }

    private getGitOutputStageLabels(mode: schemas.GitHubOutputModeSchema): Partial<TaskStageLabels> {
        switch (mode) {
            case "push":
                return {
                    pending: "Push to repository",
                    running: "Pushing to repository...",
                    success: "Pushed to repository"
                };
            case "release":
                return {
                    pending: "Create release",
                    running: "Creating release...",
                    success: "Created release"
                };
            case "pr":
                return {
                    pending: "Create pull request",
                    running: "Creating pull request...",
                    success: "Created pull request"
                };
            default:
                assertNever(mode);
        }
    }

    /**
     * Determines if a Fern token is required for the given targets and arguments.
     *
     * A Fern token is required if:
     *  - The user is relying on remote generation.
     *  - The target is using Fern's self-hosted git output mode.
     */
    private isTokenRequired({ targets, args }: { targets: Target[]; args: GenerateCommand.Args }): boolean {
        return !args.local || targets.some((t) => t.output.git != null && schemas.isGitOutputSelfHosted(t.output.git));
    }

    private maybePluralSdks(targets: Target[]): string {
        return targets.length === 1 ? "SDK" : "SDKs";
    }

    private indentBlock(text: string): string {
        return text
            .trimEnd()
            .split("\n")
            .map((line) => (line.length > 0 ? `  ${line}` : line))
            .join("\n");
    }
}

function isLanguage(target: string): target is Language {
    return (LANGUAGES as readonly string[]).includes(target);
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new GenerateCommand();
    command(
        cli,
        "generate",
        "Generate SDKs from fern.yml or directly from an API spec",
        async (context, args) => {
            const timeout = new Promise<never>((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new CliError({
                                message: "Generation timed out after 10 minutes.",
                                code: CliError.Code.NetworkError
                            })
                        ),
                    GENERATE_COMMAND_TIMEOUT_MS
                ).unref();
            });
            await Promise.race([cmd.handle(context, args as GenerateCommand.Args), timeout]);
        },
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Path or URL to an API spec file (enables no-config mode)"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    description: "Filter the target API(s) with the given audience(s)"
                })
                .option("container-engine", {
                    choices: ["docker", "podman"],
                    description: "Choose the container engine to use for local generation"
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Ignore prompts to confirm generation"
                })
                .option("group", {
                    type: "string",
                    description: "The SDK group to generate"
                })
                .option("keep-container", {
                    type: "boolean",
                    default: false,
                    description: "Prevent auto-deletion of any containers used for local generation"
                })
                .option("local", {
                    type: "boolean",
                    default: false,
                    description: "Run the generator locally in a container"
                })
                .option("org", {
                    type: "string",
                    description: "Organization name (required with --api)"
                })
                .option("output", {
                    type: "string",
                    description: "Output path or git URL (required with --api; requires --preview in workspace mode)"
                })
                .option("output-version", {
                    type: "string",
                    description: "The version to use for the generated packages (e.g. 1.0.0)"
                })
                .option("target", {
                    type: "string",
                    description: "The SDK target to generate"
                })
                .option("target-version", {
                    type: "string",
                    description: "The generator version for the target"
                })
                .option("preview", {
                    // This flag is still accepted for convenience (i.e. users migrating from the original CLI).
                    // Users should use `fern sdk preview` instead.
                    type: "boolean",
                    default: false,
                    description: "Generate a preview of the generated SDK in a local preview directory",
                    hidden: true
                })
                .option("fernignore", {
                    type: "string",
                    description: "Path to .fernignore file",
                    hidden: true
                })
                .option("skip-fernignore", {
                    type: "boolean",
                    default: false,
                    description:
                        "Skip the .fernignore file and generate all files. For remote generation, uploads an empty .fernignore. For local generation, skips reading .fernignore from the output directory."
                })
                .option("require-env-vars", {
                    type: "boolean",
                    default: true,
                    description:
                        "Require all referenced environment variables to be defined (use --no-require-env-vars to substitute empty strings for missing variables)"
                })
    );
}
