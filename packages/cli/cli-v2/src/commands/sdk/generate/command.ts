import type { Audiences } from "@fern-api/configuration";
import type { ContainerRunner } from "@fern-api/core-utils";
import { resolve } from "@fern-api/fs-utils";
import type { Argv } from "yargs";
import { loadFernYml } from "../../../config/fern-yml/loadFernYml";
import type { Context } from "../../../context/Context";
import type { GlobalArgs } from "../../../context/GlobalArgs";
import { CliError } from "../../../errors/CliError";
import { ValidationError } from "../../../errors/ValidationError";
import type { Target } from "../../../sdk/config/Target";
import { GeneratorPipeline } from "../../../sdk/generator/GeneratorPipeline";
import { TaskGroup } from "../../../ui/TaskGroup";
import type { Workspace } from "../../../workspace/Workspace";
import { WorkspaceLoader } from "../../../workspace/WorkspaceLoader";
import { command } from "../../_internal/command";

interface GenerateArgs extends GlobalArgs {
    /** The SDK target to generate */
    target?: string;

    /** Generator group to run (from fern.yml) */
    group?: string;

    /** Filter by audiences */
    audiences?: string[];

    /** Whether to run the generator locally in a container */
    local?: boolean;

    /** Container engine to use for local generation */
    "container-engine"?: ContainerRunner;

    /** Whether to keep containers after completion */
    "keep-container"?: boolean;

    /** Preview mode */
    preview?: boolean;

    /** Output directory for preview mode */
    output?: string;

    /** Force generation without prompts */
    force?: boolean;

    /** Override the version for generated packages */
    version?: string;
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "generate", "Generate SDKs configured in fern.yml", handleGenerate, (yargs) =>
        yargs
            .option("target", {
                type: "string",
                description: "The SDK target to generate"
            })
            .option("group", {
                type: "string",
                description: "The SDK group to generate"
            })
            .option("audiences", {
                type: "array",
                string: true,
                description: "Filter the target API(s) with the given audiences"
            })
            .option("local", {
                type: "boolean",
                default: false,
                description: "Run the generator locally in a container"
            })
            .option("container-engine", {
                choices: ["docker", "podman"],
                default: "docker",
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

async function handleGenerate(context: Context, args: GenerateArgs): Promise<void> {
    validateArgs(args);

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
                organization: workspace.org,
                ai: workspace.ai,
                task,
                target,
                apiDefinition,
                audiences: parseAudiences(args.audiences),
                runtime,
                containerEngine: args["container-engine"],
                keepContainer: args["keep-container"] ?? false,
                preview: args.preview ?? false,
                outputPath: args.output != null ? resolve(context.cwd, args.output) : undefined,
                token,
                version: args.version
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

function parseAudiences(audiences: string[] | undefined): Audiences | undefined {
    if (audiences == null || audiences.length === 0) {
        return undefined;
    }
    return {
        type: "select",
        audiences
    };
}

function validateArgs(args: GenerateArgs): void {
    if (args.output != null && !args.preview) {
        throw new Error("The --output flag can only be used with --preview");
    }
    if (args["container-engine"] != null && !args.local) {
        throw new Error("The --container-engine flag can only be used with --local");
    }
    if (args.group != null && args.target != null) {
        throw new Error("The --group and --target flags cannot be used together");
    }
}

function maybePluralSdks(targets: Target[]): string {
    return targets.length === 1 ? "SDK" : "SDKs";
}
