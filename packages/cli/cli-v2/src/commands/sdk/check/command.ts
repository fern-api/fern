import chalk from "chalk";
import type { Argv } from "yargs";
import { FernYmlSchemaLoader } from "../../../config/fern-yml/FernYmlSchemaLoader.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { SdkChecker } from "../../../sdk/checker/SdkChecker.js";
import { Icons } from "../../../ui/format.js";
import { WorkspaceLoader } from "../../../workspace/WorkspaceLoader.js";
import { command } from "../../_internal/command.js";

export declare namespace CheckCommand {
    export interface Args extends GlobalArgs {
        /** Treat warnings as errors. */
        strict: boolean;
    }
}

export class CheckCommand {
    public async handle(context: Context, args: CheckCommand.Args): Promise<void> {
        const schemaLoader = new FernYmlSchemaLoader({ cwd: context.cwd });
        const fernYml = await schemaLoader.loadOrThrow();

        context.telemetry.tag({ org: fernYml.data.org });

        const loader = new WorkspaceLoader({ cwd: context.cwd, logger: context.stderr });
        const workspace = await loader.loadOrThrow({ fernYml });

        const checker = new SdkChecker({ context });
        const result = await checker.check({ workspace, fernYml });

        if (result.errorCount > 0 || (args.strict && result.warningCount > 0)) {
            throw CliError.exit();
        }

        if (result.warningCount > 0) {
            context.stderr.info(chalk.dim("  Run 'fern sdk check --strict' to treat warnings as errors"));
            return;
        }

        context.stderr.info(`${Icons.success} ${chalk.green("All checks passed")}`);
    }
}

export function addCheckCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
    const cmd = new CheckCommand();
    command(
        cli,
        "check",
        "Validate SDK configuration",
        (context, args) => cmd.handle(context, args as CheckCommand.Args),
        (yargs) =>
            yargs.option("strict", {
                type: "boolean",
                description: "Treat warnings as errors",
                default: false
            }),
        parentPath
    );
}
