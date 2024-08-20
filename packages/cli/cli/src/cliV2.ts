import { Argv } from "yargs";
import { CliContext } from "./cli-context/CliContext";
import { GlobalCliOptions, loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons";
import { getGeneratorList } from "./commands/generator-list/getGeneratorList";
import { getOrganziation } from "./commands/organization/getOrganization";

export function addGetOrganizationCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "organization",
        // Hides the command from the help message
        false,
        (yargs) =>
            yargs.option("output", {
                string: true,
                alias: "o",
                description: "The location to output the organization name as a text file, defaults to standard out."
            }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern organization",
                properties: {
                    outputLocation: argv.output
                }
            });
            await getOrganziation({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: undefined,
                    defaultToAllApiWorkspaces: true
                }),
                context: cliContext,
                outputLocation: argv.output
            });
        }
    );
}

export function addGeneratorListCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "generator list",
        // Hides the command from the help message
        false,
        (yargs) =>
            yargs
                .option("output", {
                    string: true,
                    alias: "o",
                    description: "The location to output the list as a text file, defaults to standard out."
                })
                .option("generators", {
                    string: true,
                    type: "array",
                    description:
                        "The type of generator to include in the list, ex: `fern-typescript-node-sdk`. If omitted, all generators will be listed."
                })
                .option("groups", {
                    type: "array",
                    string: true,
                    description:
                        "The groups to include generators from, if group is not specified, the all generators of the specified type will be listed."
                })
                .option("apis", {
                    type: "array",
                    string: true,
                    description:
                        "The APIs to list the generators for. If not specified, the generator will be upgraded for all APIs."
                })
                .option("api-fallback", {
                    string: true,
                    // Don't love this, but also don't know how else to maintain this structure without assuming some sentinel,
                    // which this feels better than.
                    description:
                        "The APIs to list the generators for. If not specified, the generator will be upgraded for all APIs."
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern generator list",
                properties: {
                    outputLocation: argv.output
                }
            });
            await getGeneratorList({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: undefined,
                    defaultToAllApiWorkspaces: true
                }),
                generatorFilter: argv.generators ? new Set(argv.generators) : undefined,
                groupFilter: argv.groups ? new Set(argv.groups) : undefined,
                apiFilter: argv.apis ? new Set(argv.apis) : undefined,
                apiKeyFallback: argv.apiFallback,
                cliContext: cliContext,
                outputLocation: argv.output
            });
        }
    );
}
