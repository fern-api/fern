import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import YAML from "yaml";

import {
    getGeneratorNameOrThrow,
    getLatestGeneratorVersion,
    getPathToGeneratorsConfiguration,
    loadRawGeneratorsConfiguration
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistry } from "@fern-fern/generators-sdk";

import { CliContext } from "../../cli-context/CliContext";

export async function loadAndUpdateGenerators({
    absolutePathToWorkspace,
    context,
    generatorFilter,
    groupFilter,
    includeMajor,
    channel,
    cliVersion
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    generatorFilter: string | undefined;
    groupFilter: string | undefined;
    includeMajor: boolean;
    channel: FernRegistry.generators.ReleaseType | undefined;
    cliVersion: string;
}): Promise<string | undefined> {
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (filepath == null || !(await doesPathExist(filepath))) {
        context.logger.debug("Generators configuration file was not found, no generators to upgrade.");
        return undefined;
    }
    const contents = await readFile(filepath);
    context.logger.debug(`Found generators: ${contents.toString()}`);

    const parsedDocument = YAML.parseDocument(contents.toString());
    // We cannot use zod to parse the schema since then it loses order
    // is there a better, type-safe way to do this???
    const generatorGroups = parsedDocument.get("groups");
    if (generatorGroups == null) {
        context.logger.debug("No groups were found within the generators configuration, no generators to upgrade.");
        return undefined;
    }
    if (!YAML.isMap(generatorGroups)) {
        context.failAndThrow(`Expected 'groups' to be a map in ${path.relative(process.cwd(), filepath)}`);
        return undefined;
    }
    context.logger.debug(`Groups found: ${generatorGroups.toString()}`);

    for (const groupBlock of generatorGroups.items) {
        // The typing appears to be off in this lib, but BLOCK.key.value is meant to always be available
        // https://eemeli.org/yaml/#creating-nodes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const groupName = (groupBlock.key as any).value as string;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        const group = groupBlock.value as YAML.YAMLMap<string, YAML.YAMLSeq<YAML.YAMLMap<unknown, unknown>>>;
        if (!YAML.isMap(group)) {
            context.failAndThrow(
                `Expected group ${groupName} to be a map in ${path.relative(process.cwd(), filepath)}`
            );
            continue;
        }

        if (groupFilter != null && groupFilter !== groupName) {
            context.logger.debug(`Skipping group ${groupName} as it does not match the filter: ${groupFilter}`);
            continue;
        }

        const generators = group.get("generators");

        if (!YAML.isSeq(generators)) {
            context.failAndThrow(
                `Expected group ${groupName} to have a 'generators' key in ${path.relative(process.cwd(), filepath)}`
            );
            continue;
        }
        context.logger.debug(`Generators found: ${generators.toString()}`);
        for (const generator of generators.items) {
            if (!YAML.isMap(generator)) {
                context.failAndThrow(
                    `Expected generator in group ${groupName} to be a map in ${path.relative(process.cwd(), filepath)}`
                );
            }
            const generatorName = generator.get("name") as string;

            if (generatorFilter != null && generatorName !== generatorFilter) {
                context.logger.debug(
                    `Skipping generator ${generatorName} as it does not match the filter: ${generatorFilter}`
                );
                continue;
            }

            const normalizedGeneratorName = getGeneratorNameOrThrow(generatorName, context);

            const currentGeneratorVersion = generator.get("version") as string;

            const latestVersion = await getLatestGeneratorVersion({
                generatorName: normalizedGeneratorName,
                cliVersion,
                currentGeneratorVersion,
                channel,
                includeMajor,
                context
            });

            if (latestVersion == null) {
                continue;
            }
            context.logger.debug(
                chalk.green(`Upgrading ${generatorName} from ${currentGeneratorVersion} to ${latestVersion}`)
            );
            generator.set("version", latestVersion);
        }
    }

    return parsedDocument.toString();
}

export async function upgradeGenerator({
    cliContext,
    generator,
    group,
    project: { apiWorkspaces },
    includeMajor,
    channel
}: {
    cliContext: CliContext;
    generator: string | undefined;
    group: string | undefined;
    project: Project;
    includeMajor: boolean;
    channel: FernRegistry.generators.ReleaseType | undefined;
}): Promise<void> {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // Not totally necessary, but keeping around to ensure the schema is valid
                const generatorsConfiguration =
                    (await loadRawGeneratorsConfiguration({
                        absolutePathToWorkspace: workspace.absoluteFilePath,
                        context
                    })) ?? {};
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    context.logger.debug(
                        "No groups were found within the generators configuration, no generators to upgrade."
                    );
                    return;
                }

                if (workspace.workspaceName == null) {
                    context.logger.info("Upgrading generators.");
                } else {
                    context.logger.info(`Upgrading generators in workspace: ${workspace.workspaceName}.`);
                }

                const updatedConfiguration = await loadAndUpdateGenerators({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context,
                    generatorFilter: generator,
                    groupFilter: group,
                    includeMajor,
                    channel,
                    cliVersion: cliContext.environment.packageVersion
                });

                const absolutePathToGeneratorsConfiguration = await getPathToGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath
                });

                if (absolutePathToGeneratorsConfiguration != null && updatedConfiguration != null) {
                    await writeFile(absolutePathToGeneratorsConfiguration, updatedConfiguration);
                }
            });
        })
    );
}
