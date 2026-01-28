import { resolve } from "@fern-api/fs-utils";
import type { Argv } from "yargs";
import { loadFernYml } from "../../config/fern-yml/loadFernYml";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { CliError } from "../../errors/CliError";
import { ValidationError } from "../../errors/ValidationError";
import { Target } from "../../sdk/config/Target";
import { GeneratorPipeline } from "../../sdk/generator/GeneratorPipeline";
import { TaskGroup } from "../../ui/TaskGroup";
import { Workspace } from "../../workspace/Workspace";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader";
import { command } from "../_internal/command";

interface GenerateArgs extends GlobalArgs {
    /** The SDK target to generate */
    target?: string;

    /** Generator group to run (from fern.yml) */
    group?: string;

    /** Whether to run the generator locally in a container */
    local?: boolean;

    /** Whether to keep containers after completion */
    "keep-container"?: boolean;

    /** Preview mode */
    preview?: boolean;

    /** Output directory for preview mode */
    output?: string;

    /** Force generation without prompts */
    force?: boolean;
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    command(
        cli,
        "generate",
        "Generate SDKs configured in fern.yml",
        handleGenerate,
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
                .option("local", {
                    type: "boolean",
                    default: false,
                    description: "Run the generator locally in a container"
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
        // TODO: Add remaining options (e.g. audiences, container runtime, etc).
    );
}

async function handleGenerate(context: Context, args: GenerateArgs): Promise<void> {
    if (args.output != null && !args.preview) {
        // TODO: Add support for --output override when there is exactly one target.
        throw new Error("The --output flag can only be used with --preview");
    }

    const fernYml = await loadFernYml({ cwd: context.cwd });

    const loader = new WorkspaceLoader({ cwd: context.cwd, logger: context.stderr });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new ValidationError(result.issues);
    }

    const workspace = result.workspace;
    if (workspace.sdks == null) {
        throw new Error("No SDKs configured in fern.yml");
    }

    const targets = getTargets({
        workspace,
        groupName: args.group ?? workspace.sdks.defaultGroup,
        targetName: args.target
    });

    const pipeline = new GeneratorPipeline({
        context,
        cliVersion: workspace.cliVersion
    });

    const runtime = args.local ? "local" : "remote";
    const token = await context.getAuthToken();
    if (runtime === "remote" && token == null) {
        throw CliError.authRequired();
    }

    const taskGroup = new TaskGroup({ context });
    for (const target of targets) {
        taskGroup.addTask({
            id: target.name,
            name: target.name
        });
    }

    await taskGroup.start({
        title: "Generating SDKs",
        subtitle: `org: ${workspace.sdks.org}`
    });

    await Promise.all(
        targets.map(async (target) => {
            const apiDefinition = workspace.apis[target.api];
            if (apiDefinition == null) {
                const message = `API '${target.api}' not found in workspace`;
                taskGroup.updateTask({
                    id: target.name,
                    update: { status: "error", error: message }
                });
                return;
            }

            const task = taskGroup.getTask(target.name);
            if (task == null) {
                // This should be unreachable.
                throw new Error(`Internal error; task '${target.name}' not found`);
            }

            taskGroup.updateTask({
                id: target.name,
                update: {
                    status: "running",
                    currentStep: `${target.image}:${target.version}`
                }
            });

            const result = await pipeline.run({
                task,
                target,
                apiDefinition,
                runtime,
                keepContainer: args["keep-container"] ?? false,
                preview: args.preview ?? false,
                outputPath: args.output != null ? resolve(context.cwd, args.output) : undefined,
                organization: workspace.org,
                token
            });
            if (!result.success) {
                taskGroup.updateTask({
                    id: target.name,
                    update: {
                        status: "error",
                        error: result.error
                    }
                });
                return;
            }
            taskGroup.updateTask({
                id: target.name,
                update: {
                    status: "success",
                    output: result.output
                }
            });
        })
    );

    const summary = taskGroup.complete({
        successMessage: `Successfully generated ${maybePluralSdks(targets)}`,
        errorMessage: `Failed to generate ${maybePluralSdks(targets)}`
    });

    if (summary.failedCount > 0) {
        throw CliError.exit();
    }
}

function getTargets({
    workspace,
    groupName,
    targetName
}: {
    workspace: Workspace;
    groupName: string | undefined;
    targetName: string | undefined;
}): Target[] {
    const targets = workspace.sdks != null ? filterTargetsByGroup(workspace.sdks.targets, groupName) : [];
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

/**
 * Filter targets by group name. If no group is specified, returns all targets.
 */
function filterTargetsByGroup(targets: Target[], groupName: string | undefined): Target[] {
    if (groupName == null) {
        return targets;
    }
    return targets.filter((target) => target.groups?.includes(groupName));
}

function maybePluralSdks(targets: Target[]): string {
    return targets.length === 1 ? "SDK" : "SDKs";
}
