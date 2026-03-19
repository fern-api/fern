import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { dirname } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import type { Argv } from "yargs";

import { LegacyFernWorkspaceAdapter } from "../../../api/adapter/LegacyFernWorkspaceAdapter.js";
import { TaskContextAdapter } from "../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";
import { checkOrThrow } from "../utils/checkOrThrow.js";
import { resolveApi } from "../utils/resolveApi.js";
import { convertIrToOpenApi } from "./convertIrToOpenApi.js";

export declare namespace ExportCommand {
    export interface Args extends GlobalArgs {
        api?: string;
        output: string;
        indent: number;
    }
}

export class ExportCommand {
    public async handle(context: Context, args: ExportCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();
        const { apiName, definition } = resolveApi(args, workspace);

        await checkOrThrow({ context, workspace, apiName });

        const taskContext = new TaskContextAdapter({ context });
        const adapter = new LegacyFernWorkspaceAdapter({
            context,
            cliVersion: workspace.cliVersion
        });

        const fernWorkspace = await adapter.adapt(definition);

        const ir = generateIntermediateRepresentation({
            workspace: fernWorkspace,
            generationLanguage: undefined,
            context: taskContext,
            exampleGeneration: { disabled: true },
            audiences: { type: "all" },
            sourceResolver: new SourceResolverImpl(taskContext, fernWorkspace),
            disableDynamicExamples: true,
            keywords: undefined,
            smartCasing: false,
            readme: undefined,
            version: undefined,
            packageName: undefined
        });

        const openapi = convertIrToOpenApi({
            apiName,
            ir
        });

        await this.writeOutput(context, args, openapi);
    }

    private async writeOutput(context: Context, args: ExportCommand.Args, openapi: unknown): Promise<void> {
        const indent = args.indent;

        if (args.output === "-") {
            const output = JSON.stringify(openapi, undefined, indent);
            process.stdout.write(output);
            return;
        }

        const outputPath = context.resolveOutputFilePath(args.output);
        if (outputPath == null) {
            return;
        }

        await mkdir(dirname(outputPath), { recursive: true });

        const isJson = outputPath.toLowerCase().endsWith(".json");
        const content = isJson ? JSON.stringify(openapi, undefined, indent) : yaml.dump(openapi, { indent });

        await writeFile(outputPath, content);
        context.stderr.info(`${Icons.success} Wrote OpenAPI spec to ${chalk.bold(outputPath)}`);
    }
}

export function addExportCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ExportCommand();
    command(
        cli,
        "export",
        "Export Fern definition as OpenAPI 3.0.1",
        (context, args) => cmd.handle(context, args as ExportCommand.Args),
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Select a specific API to export"
                })
                .option("output", {
                    type: "string",
                    demandOption: true,
                    nargs: 1,
                    description: 'Output path (.json, .yaml, .yml) or "-" for stdout'
                })
                .option("indent", {
                    type: "number",
                    default: 2,
                    description: "Indentation level for output"
                })
    );
}
