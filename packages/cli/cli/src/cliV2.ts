import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { Argv } from "yargs";
import { CliContext } from "./cli-context/CliContext";
import { GlobalCliOptions, loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons";
import { getGeneratorList } from "./commands/generator-list/getGeneratorList";
import { getGeneratorMetadata } from "./commands/generator-metadata/getGeneratorMetadata";
import { getOrganziation } from "./commands/organization/getOrganization";
import { upgradeGenerator } from "./commands/upgrade/upgradeGenerator";

export function addGetOrganizationCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext): void {
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

export function addGeneratorCommands(cli: Argv<GlobalCliOptions>, cliContext: CliContext): void {
    cli.command("generator", "Operate on the generators within your Fern configuration", (yargs) => {
        yargs
            .command(
                "list",
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
                        cliContext,
                        outputLocation: argv.output
                    });
                }
            )
            .command(
                "upgrade",
                `Upgrades the specified generator in ${GENERATORS_CONFIGURATION_FILENAME} to the latest stable version.`,
                (yargs) =>
                    yargs
                        .option("generator", {
                            string: true,
                            description: "The type of generator to upgrade, ex: `fern-typescript-node-sdk`."
                        })
                        .option("group", {
                            string: true,
                            description:
                                "The group in which the generator is located, if group is not specified, the all generators of the specified type will be upgraded."
                        })
                        .option("api", {
                            string: true,
                            description:
                                "The API to upgrade the generator for. If not specified, the generator will be upgraded for all APIs."
                        })
                        .option("include-major", {
                            boolean: true,
                            default: false,
                            description:
                                "Whether or not to include major versions within the upgrade. Defaults to false, meaning major versions will be skipped."
                        }),
                async (argv) => {
                    cliContext.instrumentPostHogEvent({
                        command: "fern generator upgrade",
                        properties: {
                            generator: argv.generator,
                            version: argv.version,
                            api: argv.api,
                            group: argv.group,
                            includeMajor: argv.includeMajor
                        }
                    });
                    await upgradeGenerator({
                        cliContext,
                        generator: argv.generator,
                        group: argv.group,
                        project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                            commandLineApiWorkspace: argv.api,
                            defaultToAllApiWorkspaces: true
                        }),
                        includeMajor: argv.includeMajor
                    });
                }
            )
            .command(
                // Meant to retrieve metadata about the generator, for now this is hidden and the only option is --version
                "get",
                false,
                (yargs) =>
                    yargs
                        .option("generator", {
                            string: true,
                            demandOption: true,
                            description: "The name of the generator to get, ex: `fern-typescript-node-sdk`."
                        })
                        .option("group", {
                            string: true,
                            demandOption: true,
                            description:
                                "The group in which the generator is located."
                        })
                        .option("api", {
                            string: true,
                            description:
                                "The API in which the generator is located."
                        })
                        .option("version", {
                            boolean: true,
                            default: false,
                            description: "Get the version of the specified generator."
                        }),
                async (argv) => {
                    cliContext.instrumentPostHogEvent({
                        command: "fern generator get",
                        properties: {
                            generator: argv.generator,
                            version: argv.version,
                            api: argv.api,
                            group: argv.group,
                            includeMajor: argv.includeMajor
                        }
                    });
                    if (argv.version) {
                        await getGeneratorMetadata({
                            cliContext,
                            generatorFilter: argv.generator,
                            groupFilter: argv.group,
                            apiFilter: argv.api,
                            project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                                commandLineApiWorkspace: argv.api,
                                defaultToAllApiWorkspaces: true
                            })
                        });
                    }
                }
            );
    });
}
