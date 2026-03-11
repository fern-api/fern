import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";
import { GENERATE_COMMAND_TIMEOUT_MS } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LegacyDocsPublisher } from "../../../docs/publisher/LegacyDocsPublisher.js";
import { DocsTaskGroup } from "../../../docs/task/DocsTaskGroup.js";
import { CliError } from "../../../errors/CliError.js";
import { command } from "../../_internal/command.js";

export declare namespace PublishCommand {
    export interface Args extends GlobalArgs {
        force: boolean;
        instance?: string;
        strict: boolean;
        preview: boolean;
    }
}

export class PublishCommand {
    public async handle(context: Context, args: PublishCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started."
            });
        }

        const instanceUrl = this.resolveInstanceUrl({
            instances: workspace.docs.raw.instances,
            instance: args.instance
        });

        // Confirm production publish before starting the task group.
        // The task group takes over the terminal, so the prompt must complete first.
        if (!args.preview && context.isTTY && !args.force) {
            const shouldProceed = await this.confirmPublish(instanceUrl);
            if (!shouldProceed) {
                context.stderr.info("Docs publish cancelled.");
                return;
            }
        }

        const taskGroup = await this.setupTaskGroup({ context, instanceUrl, org: workspace.org });
        const docsTask = taskGroup.getTask("publish");
        if (docsTask == null) {
            throw new CliError({ message: "Internal error; task 'publish' not found" });
        }

        docsTask.start();

        const publisher = new LegacyDocsPublisher({ context, task: docsTask.getTask() });

        docsTask.stage.validation.start();
        try {
            await publisher.validate({ strict: args.strict });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            docsTask.stage.validation.fail(message);
        }
        if (docsTask.getTask().status !== "error") {
            docsTask.stage.validation.complete();

            docsTask.stage.publish.start();
            const result = await publisher.publish({
                instanceUrl,
                preview: args.preview
            });
            if (!result.success) {
                docsTask.stage.publish.fail(result.error);
            } else {
                docsTask.stage.publish.complete();
                docsTask.complete();
            }
        }

        const summary = taskGroup.finish({
            successMessage: "Published docs",
            errorMessage: "Failed to publish docs"
        });

        if (summary.failedCount > 0) {
            throw CliError.exit();
        }
    }

    private resolveInstanceUrl({
        instances,
        instance
    }: {
        instances: Array<{ url: string }>;
        instance: string | undefined;
    }): string {
        if (instances.length === 0) {
            throw new CliError({
                message: "No docs instances configured.\n\n  Add an instance to the 'docs:' section of your fern.yml."
            });
        }

        if (instance != null) {
            const match = instances.find((i) => i.url === instance);
            if (match == null) {
                const available = instances.map((i) => `  - ${i.url}`).join("\n");
                throw new CliError({
                    message:
                        `No docs instance found with URL '${instance}'.\n\n` +
                        `Available instances:\n${available}\n\n` +
                        `  Use --instance <url> with one of the URLs above.`
                });
            }
            return match.url;
        }

        if (instances.length > 1) {
            const available = instances.map((i) => `  - ${i.url}`).join("\n");
            throw new CliError({
                message:
                    `Multiple docs instances configured. Please specify which instance to publish.\n\n` +
                    `Available instances:\n${available}\n\n` +
                    `  Use --instance <url> to select one.`
            });
        }

        const first = instances[0];
        if (first == null) {
            throw new CliError({
                message: "No docs instances configured.\n\n  Add an instance to the 'docs:' section of your fern.yml."
            });
        }
        return first.url;
    }

    private async confirmPublish(instanceUrl: string): Promise<boolean> {
        const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
            {
                type: "confirm",
                name: "confirm",
                message: `This will affect a production site ${chalk.cyan(instanceUrl)}. Are you sure you want to continue?`,
                default: false
            }
        ]);
        return confirm;
    }

    private async setupTaskGroup({
        context,
        instanceUrl,
        org
    }: {
        context: Context;
        instanceUrl: string;
        org: string;
    }): Promise<DocsTaskGroup> {
        const taskGroup = new DocsTaskGroup({ context });
        taskGroup.addTask({ id: "publish", name: instanceUrl });
        await taskGroup.start({ title: "Publishing docs", subtitle: `org: ${org}` });
        context.onShutdown(() => {
            taskGroup.finish({
                successMessage: "Published docs",
                errorMessage: "Docs publish interrupted"
            });
        });
        return taskGroup;
    }
}

export function addPublishCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
    const cmd = new PublishCommand();
    command(
        cli,
        "publish",
        "Publish your documentation site",
        async (context, args) => {
            const timeout = new Promise<never>((_, reject) => {
                setTimeout(
                    () => reject(new CliError({ message: "Docs publish timed out after 10 minutes." })),
                    GENERATE_COMMAND_TIMEOUT_MS
                ).unref();
            });
            await Promise.race([cmd.handle(context, args as PublishCommand.Args), timeout]);
        },
        (yargs) =>
            yargs
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Skip confirmation prompts"
                })
                .option("instance", {
                    type: "string",
                    description: "Select which docs instance to publish"
                })
                .option("strict", {
                    type: "boolean",
                    default: false,
                    description: "Treat all validation warnings (including broken links) as errors"
                })
                .option("preview", {
                    type: "boolean",
                    default: false,
                    description: "Generate a preview link instead of publishing to production",
                    hidden: true
                }),
        parentPath
    );
}
