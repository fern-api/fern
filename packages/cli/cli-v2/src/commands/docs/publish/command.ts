import type { FernToken } from "@fern-api/auth";
import { extractErrorMessage } from "@fern-api/core-utils";
import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { CliError, TaskAbortSignal } from "@fern-api/task-context";

import chalk from "chalk";
import inquirer from "inquirer";
import type { Argv } from "yargs";
import { GENERATE_COMMAND_TIMEOUT_MS } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LegacyProjectAdapter } from "../../../docs/adapter/LegacyProjectAdapter.js";
import { DocsChecker } from "../../../docs/checker/DocsChecker.js";
import { LegacyDocsPublisher } from "../../../docs/publisher/LegacyDocsPublisher.js";
import type { DocsStageOverrides } from "../../../docs/task/DocsTaskGroup.js";
import { DocsTaskGroup } from "../../../docs/task/DocsTaskGroup.js";
import { ValidationError } from "../../../errors/ValidationError.js";
import { promptSelect } from "../../../ui/promptSelect.js";
import { command } from "../../_internal/command.js";
export declare namespace PublishCommand {
    export interface Args extends GlobalArgs {
        force: boolean;
        instance?: string;
        previewId?: string;
        strict: boolean;
        preview: boolean;
        "skip-upload": boolean;
    }
}

export class PublishCommand {
    public async handle(context: Context, args: PublishCommand.Args): Promise<void> {
        const labels = args.preview
            ? {
                  title: "Generating preview",
                  success: "Generated preview",
                  error: "Failed to generate preview",
                  interrupt: "Docs preview interrupted"
              }
            : {
                  title: "Publishing docs",
                  success: "Published docs",
                  error: "Failed to publish docs",
                  interrupt: "Docs publish interrupted"
              };

        const stageOverrides: DocsStageOverrides | undefined = args.preview
            ? {
                  publish: {
                      pending: "Generate preview",
                      running: "Generating preview...",
                      success: "Generated preview"
                  }
              }
            : undefined;

        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const instanceUrl = await this.resolveInstanceUrl({
            context,
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

        const adapter = new LegacyProjectAdapter({ context });
        const project = adapter.adapt(workspace);

        const docsWorkspace = project.docsWorkspaces;
        if (docsWorkspace == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const ossWorkspaces = await filterOssWorkspaces(project);
        const token = await this.getToken(context);
        await context.verifyOrgAccess({ organization: workspace.org, token });

        const taskGroup = await this.setupTaskGroup({
            context,
            instanceUrl,
            org: workspace.org,
            title: labels.title,
            stageOverrides
        });
        const docsTask = taskGroup.getTask("publish");
        if (docsTask == null) {
            throw new CliError({
                message: "Internal error; task 'publish' not found",
                code: CliError.Code.InternalError
            });
        }

        docsTask.start();

        // Validate the docs workspace.
        docsTask.stage.validation.start();
        try {
            const checker = new DocsChecker({ context, task: docsTask.getTask() });
            const checkResult = await checker.check({ workspace, strict: args.strict });

            if (checkResult.hasErrors || (args.strict && checkResult.hasWarnings)) {
                throw new ValidationError(checkResult.violations);
            }
        } catch (error) {
            const message = extractErrorMessage(error);
            docsTask.stage.validation.fail(message);
        }

        if (docsTask.getTask().status !== "error") {
            docsTask.stage.validation.complete();

            // Publish the site.
            docsTask.stage.publish.start();
            const publisher = new LegacyDocsPublisher({
                context,
                task: docsTask.getTask(),
                project,
                docsWorkspace,
                ossWorkspaces,
                token
            });
            const result = await publisher.publish({
                instanceUrl,
                preview: args.preview,
                previewId: args.previewId,
                skipUpload: args["skip-upload"] || undefined
            });
            if (!result.success) {
                docsTask.stage.publish.fail(result.error);
            } else {
                docsTask.stage.publish.complete();
                const output = result.url != null ? [result.url] : undefined;
                docsTask.complete(output);
            }
        }

        const summary = taskGroup.finish({
            successMessage: labels.success,
            errorMessage: labels.error
        });

        if (summary.failedCount > 0) {
            // Individual task failures have already been reported with their
            // correct error codes via TaskContextAdapter.failWithoutThrowing.
            // Throw TaskAbortSignal so withContext exits non-zero without
            // emitting a duplicate (and mis-classified) error event.
            throw new TaskAbortSignal();
        }
    }

    private async resolveInstanceUrl({
        context,
        instances,
        instance
    }: {
        context: Context;
        instances: Array<{ url: string }>;
        instance: string | undefined;
    }): Promise<string> {
        if (instances.length === 0) {
            throw new CliError({
                message: "No docs instances configured.\n\n  Add an instance to the 'docs:' section of your fern.yml.",
                code: CliError.Code.ConfigError
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
                        `  Use --instance <url> with one of the URLs above.`,
                    code: CliError.Code.ConfigError
                });
            }
            return match.url;
        }

        if (instances.length > 1) {
            const available = instances.map((i) => `  - ${i.url}`).join("\n");
            return await promptSelect<string>({
                isTTY: context.isTTY,
                message: "Multiple docs instances configured. Select one:",
                choices: instances.map((i) => ({ name: i.url, value: i.url })),
                nonInteractiveError:
                    `Multiple docs instances configured. Please specify which instance to publish.\n\n` +
                    `Available instances:\n${available}\n\n` +
                    `  Use --instance <url> to select one.`,
                flagHint: (value) => `--instance ${value}`
            });
        }

        const first = instances[0];
        if (first == null) {
            throw new CliError({
                message: "No docs instances configured.\n\n  Add an instance to the 'docs:' section of your fern.yml.",
                code: CliError.Code.ConfigError
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
        org,
        title,
        stageOverrides
    }: {
        context: Context;
        instanceUrl: string;
        org: string;
        title: string;
        stageOverrides?: DocsStageOverrides;
    }): Promise<DocsTaskGroup> {
        const taskGroup = new DocsTaskGroup({ context });
        taskGroup.addTask({ id: "publish", name: instanceUrl, stageOverrides });
        await taskGroup.start({ title, subtitle: `org: ${org}` });
        context.onShutdown(() => {
            taskGroup.finish({
                successMessage: title,
                errorMessage: `${title} interrupted`
            });
        });
        return taskGroup;
    }

    private getToken(context: Context): Promise<FernToken> {
        const isRunningOnSelfHosted = process.env["FERN_FDR_ORIGIN"] != null;
        if (isRunningOnSelfHosted) {
            const fernToken = process.env["FERN_TOKEN"];
            if (fernToken == null) {
                throw new CliError({
                    message: "No organization token found. Please set the FERN_TOKEN environment variable.",
                    code: CliError.Code.AuthError
                });
            }
            return Promise.resolve({ type: "organization", value: fernToken });
        }
        return context.getTokenOrPrompt();
    }
}

export function addPublishCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new PublishCommand();
    command(
        cli,
        "publish",
        "Publish your documentation site",
        async (context, args) => {
            const timeout = new Promise<never>((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new CliError({
                                message: "Docs publish timed out after 10 minutes.",
                                code: CliError.Code.NetworkError
                            })
                        ),
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
                })
    );
}
