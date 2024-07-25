import { DEFINITION_DIRECTORY, generatorsYml, ROOT_API_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { FernDefinition, FernWorkspace, OSSWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { mkdir, rmdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";

export async function writeDefinitionForWorkspaces({
    project,
    cliContext,
    sdkLanguage
}: {
    project: Project;
    cliContext: CliContext;
    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace instanceof OSSWorkspace) {
                    await writeDefinitionForOpenAPIWorkspace({ workspace, context, sdkLanguage });
                } else if (workspace instanceof FernWorkspace) {
                    await writeDefinitionForFernWorkspace({ workspace, context });
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
            workspace.absoluteFilepath,
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

async function writeDefinitionForOpenAPIWorkspace({
    workspace,
    context,
    sdkLanguage
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
    sdkLanguage: generatorsYml.GenerationLanguage | undefined;
}): Promise<void> {
    const fernWorkspace = await workspace.toFernWorkspace({ context });
    const absolutePathToOutputDirectory = join(
        workspace.absoluteFilepath,
        RelativeFilePath.of(`.${DEFINITION_DIRECTORY}`)
    );
    await writeFernDefinition({
        definition: fernWorkspace.definition,
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
    if (await doesPathExist(absolutePathToOutputDirectory)) {
        await rmdir(absolutePathToOutputDirectory, { recursive: true });
    }

    // write api.yml
    await mkdir(absolutePathToOutputDirectory, { recursive: true });
    await writeFile(
        join(absolutePathToOutputDirectory, RelativeFilePath.of(ROOT_API_FILENAME)),
        yaml.dump(definition.rootApiFile.contents)
    );

    // write __package__.ymls
    for (const [relativePath, packageMarker] of Object.entries(definition.packageMarkers)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(packageMarker.contents));
    }

    // write named definition files
    for (const [relativePath, definitionFile] of Object.entries(definition.namedDefinitionFiles)) {
        const absoluteFilepath = join(absolutePathToOutputDirectory, RelativeFilePath.of(relativePath));
        await mkdir(dirname(absoluteFilepath), { recursive: true });
        await writeFile(absoluteFilepath, yaml.dump(definitionFile.contents));
    }
}
