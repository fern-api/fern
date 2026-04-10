import { LogLevel } from "@fern-api/logger";
import getPort from "get-port";
import type { Argv } from "yargs";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { LegacyDevServer } from "../../../docs/server/LegacyDevServer.js";
import { CliError } from "../../../errors/CliError.js";
import { command } from "../../_internal/command.js";

export declare namespace DevCommand {
    export interface Args extends GlobalArgs {
        port: number;
        "backend-port"?: number;
        "force-download": boolean;
        "bundle-path"?: string;
    }
}

export class DevCommand {
    public async handle(context: Context, args: DevCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started."
            });
        }

        const backendPort = args["backend-port"] ?? (await getPort());

        const server = new LegacyDevServer({ context });
        await server.start({
            port: args.port,
            backendPort,
            forceDownload: args["force-download"],
            bundlePath: args["bundle-path"],
            logLevel: LogLevel.Info
        });
    }
}

export function addDevCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new DevCommand();
    command(
        cli,
        "dev",
        "Start local docs preview server",
        (context, args) => cmd.handle(context, args as DevCommand.Args),
        (yargs) =>
            yargs
                .option("port", {
                    type: "number",
                    default: 3000,
                    description: "Port for the dev server"
                })
                .option("backend-port", {
                    type: "number",
                    description: "Port for the backend server"
                })
                .option("force-download", {
                    type: "boolean",
                    default: false,
                    description: "Force re-download of the preview bundle"
                })
                .option("bundle-path", {
                    type: "string",
                    description: "Path to a custom preview bundle"
                })
    );
}
