import type { schemas } from "@fern-api/config";
import type { Audiences } from "@fern-api/configuration";
import type { ContainerRunner } from "@fern-api/core-utils";
import { assertNever } from "@fern-api/core-utils";
import { resolve } from "@fern-api/fs-utils";
import type { Argv } from "yargs";
import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import type { Target } from "../../../sdk/config/Target.js";
import { GeneratorPipeline } from "../../../sdk/generator/GeneratorPipeline.js";
import { SdkStageOverrides, SdkTaskGroup } from "../../../sdk/task/SdkTaskGroup.js";
import type { TaskStageLabels } from "../../../ui/TaskStageLabels.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { command } from "../../_internal/command.js";

export declare namespace GenerateCommand {
    export interface Args extends GlobalArgs {
        /** The SDK target to generate */
        target?: string;

        /** Generator group to run (from fern.yml) */
        group?: string;

        /** Filter by audiences */
        audience?: string[];

        /** Whether to run the generator locally in a container */
        local: boolean;

        /** Container engine to use for local generation */
        "container-engine"?: ContainerRunner;

        /** Whether to keep containers after completion */
        "keep-container": boolean;

        /** Preview mode */
        preview: boolean;

        /** Output directory for preview mode */
        output?: string;

        /** Force generation without prompts */
        force: boolean;

        /** Override the version for generated packages */
        version?: string;
    }
}

export class GenerateCommand {
    public async handle(context: Context, args: GenerateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();
        if (workspace.sdks == null) {
            throw new Error("No SDKs configured in fern.yml");
        }

        this.validateArgs({ workspace, args });

        const targets = this.getTargets({
            workspace,
            groupName: args.group ?? workspace.sdks.defaultGroup,
            targetName: args.target
        });

        const apisToCheck = [...new Set(targets.map((t) => t.api))];
        const checker = new ApiChecker({
            context,
            cliVersion: workspace.cliVersion
        });

        const checkResult = await checker.check({
            workspace,
            apiNames: apisToCheck
        });

        const validTargets = targets.filter((t) => checkResult.validApis.has(t.api));
        if (validTargets.length === 0) {
            throw CliError.exit();
        }

        const pipeline = new GeneratorPipeline({
            context,
            cliVersion: workspace.cliVersion
        });

        const token = args.local ? undefined : await context.getTokenOrPrompt();
        const runtime = args.local ? "local" : "remote";

        const taskGroup = new SdkTaskGroup({ context });
        for (const target of targets) {
            const stageOverrides: SdkStageOverrides | undefined =
                target.output.git != null
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

        const sdkInitialism = this.maybePluralSdks(targets);

        await taskGroup.start({
            title: `Generating ${sdkInitialism}`,
            subtitle: `org: ${workspace.sdks.org}`
        });

        await Promise.all(
            targets.map(async (target) => {
                const task = taskGroup.getTask(target.name);
                if (task == null) {
                    // This should be unreachable.
                    throw new Error(`Internal error; task '${target.name}' not found`);
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
                    version: args.version
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
            throw CliError.exit();
        }
    }

    private validateArgs({ workspace, args }: { workspace: Workspace; args: GenerateCommand.Args }): void {
        if (args.output != null && !args.preview) {
            throw new Error("The --output flag can only be used with --preview");
        }
        if (args["container-engine"] != null && !args.local) {
            throw new Error("The --container-engine flag can only be used with --local");
        }
        if (args.group != null && args.target != null) {
            throw new Error("The --group and --target flags cannot be used together");
        }
        const defaultGroup = workspace.sdks?.defaultGroup;
        if (defaultGroup == null && args.group == null && args.target == null) {
            throw new Error("A --target or --group must be specified");
        }
    }

    private getTargets({
        workspace,
        groupName,
        targetName
    }: {
        workspace: Workspace;
        groupName: string | undefined;
        targetName: string | undefined;
    }): Target[] {
        const targets = workspace.sdks != null ? this.filterTargetsByGroup(workspace.sdks.targets, groupName) : [];
        if (targetName != null) {
            const filtered = targets.filter((t) => t.name === targetName);
            if (filtered.length === 0) {
                throw new Error(`Target '${targetName}' not found`);
            }
            return filtered;
        }
        if (targets.length === 0) {
            if (groupName != null) {
                throw new Error(`No targets found for group '${groupName}'`);
            }
            throw new Error("No targets configured in fern.yml");
        }
        return targets;
    }

    private filterTargetsByGroup(targets: Target[], groupName: string | undefined): Target[] {
        if (groupName == null) {
            return targets;
        }
        return targets.filter((target) => target.groups?.includes(groupName));
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

    private maybePluralSdks(targets: Target[]): string {
        return targets.length === 1 ? "SDK" : "SDKs";
    }

    private getGitOutputStageLabels(mode: schemas.GitOutputModeSchema): Partial<TaskStageLabels> {
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
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new GenerateCommand();
    command(
        cli,
        "generate",
        "Generate SDKs configured in fern.yml",
        (context, args) => cmd.handle(context, args as GenerateCommand.Args),
        (yargs) =>
            yargs
                .option("target", {
                    type: "string",
                    description: "The SDK target to generate"
                })
                .option("group", {
                    type: "string",
                    description: "The SDK group to generate"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    description: "Filter the target API(s) with the given audience(s)"
                })
                .option("local", {
                    type: "boolean",
                    default: false,
                    description: "Run the generator locally in a container"
                })
                .option("container-engine", {
                    choices: ["docker", "podman"],
                    description: "Choose the container engine to use for local generation"
                })
                .option("keep-container", {
                    type: "boolean",
                    default: false,
                    description: "Prevent auto-deletion of any containers used for local generation"
                })
                .option("preview", {
                    type: "boolean",
                    default: false,
                    description: "Generate a preview of the generated SDK in a local preview directory"
                })
                .option("output", {
                    type: "string",
                    description: "Output directory for preview mode (requires --preview)"
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Ignore prompts to confirm generation"
                })
                .option("version", {
                    type: "string",
                    description: "The version to use for the generated packages (e.g. 1.0.0)"
                })
    );
}
