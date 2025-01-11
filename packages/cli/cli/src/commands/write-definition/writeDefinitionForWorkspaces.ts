import chalk from "chalk";
import { mkdir, rmdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { DEFINITION_DIRECTORY, ROOT_API_FILENAME, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, dirname, doesPathExist, join } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { FernDefinition, FernWorkspace } from "@fern-api/workspace-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function writeDefinitionForWorkspaces({
    project,
    cliContext,
    sdkLanguage,
    preserveSchemaIds
}: {
    project: Project;
    cliContext: CliContext;
    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
    preserveSchemaIds: boolean;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace instanceof FernWorkspace) {
                    await writeDefinitionForFernWorkspace({ workspace, context });
                } else {
                    await writeDefinitionForNonFernWorkspace({
                        workspace: await workspace.toFernWorkspace({ context }, { preserveSchemaIds }),
                        context
                    });
                }
            });
        })
    );
}

async function writeDefinitionForFernWorkspace({
    workspace,
    context
}: {
    workspace: FernWorkspace;
    context: TaskContext;
}): Promise<void> {
    for (const [relativePath, importedDefinition] of Object.entries(workspace.definition.importedDefinitions)) {
        const absolutePathToOutputDirectory = join(
            workspace.absoluteFilePath,
            RelativeFilePath.of(DEFINITION_DIRECTORY),
            RelativeFilePath.of(relativePath),
            RelativeFilePath.of(`.${DEFINITION_DIRECTORY}`)
        );
        await writeFernDefinition({
            definition: importedDefinition.definition,
            absolutePathToOutputDirectory
        });
        context.logger.info(
            chalk.green(`Wrote imported definition at ${path.relative(process.cwd(), absolutePathToOutputDirectory)}`)
        );
    }
}

async function writeDefinitionForNonFernWorkspace({
    workspace,
    context
}: {
    workspace: FernWorkspace;
    context: TaskContext;
}): Promise<void> {
    const absolutePathToOutputDirectory = join(
        workspace.absoluteFilePath,
        RelativeFilePath.of(`.${DEFINITION_DIRECTORY}`)
    );
    await writeFernDefinition({
        definition: workspace.definition,
        absolutePathToOutputDirectory
    });
    context.logger.info(
        chalk.green(`Wrote definition to ${path.relative(process.cwd(), absolutePathToOutputDirectory)}`)
    );
}

async function writeFernDefinition({
    definition,
    absolutePathToOutputDirectory
}: {
    definition: FernDefinition;
    absolutePathToOutputDirectory: AbsoluteFilePath;
}): Promise<void> {
    const sortKeys = (a: string, b: string): number => {
        const customOrder: Record<string, number> = {
            imports: 0,
            types: 1,
            services: 2
        };

        const orderA = a in customOrder ? customOrder[a] : Object.keys(customOrder).length;
        const orderB = b in customOrder ? customOrder[b] : Object.keys(customOrder).length;

        if (orderA == null) {
            return -1;
        } else if (orderB == null) {
            return 1;
        } else if (orderA !== orderB) {
            return orderA - orderB;
        }

        // If both keys have the same custom order (or are both not in the custom order),
        // sort alphabetically
        return a.localeCompare(b);
    };

    if (await doesPathExist(absolutePathToOutputDirectory)) {
        await rmdir(absolutePathToOutputDirectory, { recursive: true });
    }

    // write api.yml
    await mkdir(absolutePathToOutputDirectory, { recursive: true });
    await writeFile(
        join(absolutePathToOutputDirectory, RelativeFilePath.of(ROOT_API_FILENAME)),
        yaml.dump(definition.rootApiFile.contents, { sortKeys })
    );

    // write __package__.ymls
    for (const [relativePath, packageMarker] of Object.entries(definition.packageMarkers)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(packageMarker.contents, { sortKeys }));
    }

    // write named definition files
    for (const [relativePath, definitionFile] of Object.entries(definition.namedDefinitionFiles)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(definitionFile.contents, { sortKeys }));
    }
}
