import { Argv } from "yargs";
import { CliContext } from "../../cli-context/CliContext.js";
import { GlobalCliOptions, loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { pullApiSpecWithOrchestration } from "../pull-api-spec/pullApiSpec.js";
import { syncSpecs } from "../sync-specs/syncSpecs.js";

export function addGhaCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext): void {
    cli.command(
        "gha",
        false, // hidden from --help
        (gha) => {
            gha.command(
                "pull-spec",
                false,
                (yargs) =>
                    yargs
                        .option("token", {
                            type: "string",
                            demandOption: true,
                            description: "GitHub token with contents:write and pull-requests:write"
                        })
                        .option("branch", {
                            type: "string",
                            default: "fern/pull-spec",
                            description: "Branch name to create or update"
                        })
                        .option("auto-merge", {
                            type: "boolean",
                            default: false,
                            description: "Push directly to branch without opening a PR"
                        })
                        .option("indent", {
                            type: "number",
                            description: "Indentation width in spaces (default: 2)",
                            default: 2
                        }),
                async (argv) => {
                    await cliContext.instrumentPostHogEvent({ command: "fern gha pull-spec" });
                    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: undefined,
                        defaultToAllApiWorkspaces: true
                    });
                    await pullApiSpecWithOrchestration({
                        options: {
                            token: argv.token,
                            branch: argv.branch,
                            autoMerge: argv["auto-merge"],
                            cwd: process.cwd()
                        },
                        cliContext,
                        project,
                        indent: argv.indent
                    });
                }
            );

            gha.command(
                "sync-specs",
                false,
                (yargs) =>
                    yargs
                        .option("repository", {
                            type: "string",
                            demandOption: true,
                            description: 'Target repository in "owner/repo" format'
                        })
                        .option("sources", {
                            type: "string",
                            demandOption: true,
                            description: "YAML or JSON array of {from, to, exclude?} file mappings"
                        })
                        .option("token", {
                            type: "string",
                            demandOption: true,
                            description:
                                "GitHub token with contents:write and pull-requests:write on the target repository"
                        })
                        .option("branch", {
                            type: "string",
                            default: "fern/sync-specs",
                            description: "Branch name to create or update in the target repository"
                        })
                        .option("auto-merge", {
                            type: "boolean",
                            default: false,
                            description: "Push directly to branch without opening a PR"
                        }),
                async (argv) => {
                    await cliContext.instrumentPostHogEvent({ command: "fern gha sync-specs" });
                    await cliContext.runTask(async () => {
                        await syncSpecs({
                            options: {
                                repository: argv.repository,
                                sources: argv.sources,
                                token: argv.token,
                                branch: argv.branch,
                                autoMerge: argv["auto-merge"],
                                cwd: process.cwd()
                            },
                            cliContext
                        });
                    });
                }
            );

            return gha;
        },
        () => {
            cli.showHelp();
        }
    );
}
