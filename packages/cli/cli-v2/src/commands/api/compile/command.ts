import { Audiences } from "@fern-api/configuration";
import { streamObjectToFile } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import { JsonStreamStringify } from "json-stream-stringify";
import type { Argv } from "yargs";
import { ApiChecker } from "../../../api/checker/ApiChecker.js";
import { IrCompiler } from "../../../api/compiler/IrCompiler.js";
import type { ApiDefinition } from "../../../api/config/ApiDefinition.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LANGUAGES } from "../../../sdk/config/Language.js";
import type { Workspace } from "../../../workspace/Workspace.js";
import { command } from "../../_internal/command.js";

export declare namespace CompileCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        audience?: string[];
        language?: string;
        dynamic: boolean;
        output?: string;
        "disable-examples": boolean;
        "ir-version"?: string;
    }
}

export class CompileCommand {
    public async handle(context: Context, args: CompileCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();
        const entries = this.resolveApiEntries(args, workspace);

        // --output writes to a single file path; it cannot target multiple APIs at once.
        if (args.output != null && entries.length > 1) {
            throw new CliError({
                message: `--output requires --api when multiple APIs are configured`,
                code: CliError.Code.ConfigError
            });
        }

        const compiler = new IrCompiler({
            context,
            cliVersion: workspace.cliVersion
        });

        const audiences: Audiences =
            args.audience != null && args.audience.length > 0
                ? { type: "select", audiences: args.audience }
                : { type: "all" };

        const options: IrCompiler.Options = {
            language: args.language as IrCompiler.Options["language"],
            audiences,
            disableExamples: args["disable-examples"],
            irVersion: args["ir-version"]
        };

        for (const { apiName, definition } of entries) {
            await this.checkOrThrow({ context, workspace, apiName });

            const result = args.dynamic
                ? await compiler.compileDynamic({ apiName, definition, options })
                : await compiler.compile({ apiName, definition, options });

            await this.writeOutput(context, args, result.object);
        }
    }

    /**
     * Resolves the set of APIs to compile.
     *
     * - If `--api` is provided, returns only that API (throws if not found).
     * - Otherwise returns all APIs in the workspace, matching the behavior of
     *   `check`, `merge`, and `split` which also run on all APIs by default.
     */
    private resolveApiEntries(
        args: CompileCommand.Args,
        workspace: Workspace
    ): Array<{ apiName: string; definition: ApiDefinition }> {
        const allApiNames = Object.keys(workspace.apis);

        if (args.api != null) {
            const definition = workspace.apis[args.api];
            if (definition == null) {
                const available = allApiNames.join(", ");
                throw new CliError({
                    message: `API '${args.api}' not found. Available APIs: ${available}`,
                    code: CliError.Code.ConfigError
                });
            }
            return [{ apiName: args.api, definition }];
        }

        return allApiNames.flatMap((apiName) => {
            const definition = workspace.apis[apiName];
            return definition != null ? [{ apiName, definition }] : [];
        });
    }

    private async checkOrThrow({
        context,
        workspace,
        apiName
    }: {
        context: Context;
        workspace: Workspace;
        apiName: string;
    }): Promise<void> {
        const checker = new ApiChecker({ context, cliVersion: workspace.cliVersion });
        const result = await checker.check({ workspace, apiNames: [apiName] });
        if (result.invalidApis.size > 0) {
            for (const violation of result.violations) {
                context.stderr.error(
                    `${violation.displayRelativeFilepath}:${violation.line}:${violation.column}: ${violation.message}`
                );
            }
            throw CliError.validationError(`API '${apiName}' has ${result.violations.length} validation errors`);
        }
    }

    private async writeOutput(context: Context, args: CompileCommand.Args, object: unknown): Promise<void> {
        if (args.output === "-") {
            const stream = new JsonStreamStringify(object, undefined, 2);
            stream.pipe(process.stdout);
            return new Promise((resolve, reject) => {
                stream.on("end", resolve);
                stream.on("error", reject);
            });
        }
        if (args.output != null) {
            const outputPath = context.resolveOutputFilePath(args.output);
            if (outputPath != null) {
                await streamObjectToFile(outputPath, object, { pretty: true });
                context.stderr.debug(chalk.dim(`  Wrote IR to ${outputPath}`));
            }
            return;
        }
        // No output specified — just compile and validate.
    }
}

export function addCompileCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new CompileCommand();
    command(
        cli,
        "compile",
        "Compile your API specs",
        (context, args) => cmd.handle(context, args as CompileCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Select a specific API to compile"
                })
                .option("audience", {
                    type: "string",
                    array: true,
                    description: "Filter IR to specific audiences"
                })
                .option("disable-examples", {
                    type: "boolean",
                    description: "Disable example generation in IR",
                    default: false
                })
                .option("dynamic", {
                    type: "boolean",
                    description: "Output Dynamic IR instead of standard IR",
                    default: false
                })
                .option("ir-version", {
                    type: "string",
                    description: "Target IR version (e.g. v53). Defaults to latest."
                })
                .option("language", {
                    type: "string",
                    description: "Target language for IR generation",
                    choices: LANGUAGES
                })
                .option("output", {
                    type: "string",
                    nargs: 1,
                    description: 'Path to write IR output. Use "-" for stdout.'
                })
    );
}
