import { Audiences } from "@fern-api/configuration";
import { streamObjectToFile } from "@fern-api/fs-utils";
import chalk from "chalk";
import { JsonStreamStringify } from "json-stream-stringify";
import type { Argv } from "yargs";
import { IrCompiler } from "../../../api/compiler/IrCompiler.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LANGUAGES } from "../../../sdk/config/Language.js";
import { command } from "../../_internal/command.js";
import { checkOrThrow } from "../utils/checkOrThrow.js";
import { resolveApi } from "../utils/resolveApi.js";

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
        const { apiName, definition } = resolveApi(args, workspace);

        await checkOrThrow({ context, workspace, apiName });

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

        const result = args.dynamic
            ? await compiler.compileDynamic({ apiName, definition, options })
            : await compiler.compile({ apiName, definition, options });

        await this.writeOutput(context, args, result.object);
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
