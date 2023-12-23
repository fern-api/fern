import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DEFINITION_DIRECTORY, ROOT_API_FILENAME } from "@fern-api/project-configuration";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import {
    convertOpenApiWorkspaceToFernWorkspace,
    FernDefinition,
    FernWorkspace,
    OpenAPIWorkspace
} from "@fern-api/workspace-loader";
import { formatDefinitionFile } from "@fern-api/yaml-formatter";
import chalk from "chalk";
import { mkdir, rmdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { CliContext } from "../../cli-context/CliContext";

export async function writeDefinitionForWorkspaces({
    project,
    cliContext
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (workspace.type === "openapi") {
                    await writeDefinitionForOpenAPIWorkspace({ workspace, context });
                } else {
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
    for (const [relativePath, definition] of Object.entries(workspace.definition.importedDefinitions)) {
        const absolutePathToOutputDirectory = join(
            workspace.absoluteFilepath,
            RelativeFilePath.of(DEFINITION_DIRECTORY),
            RelativeFilePath.of(relativePath),
            RelativeFilePath.of(`.${DEFINITION_DIRECTORY}`)
        );
        await writeFernDefinition({
            definition,
            absolutePathToOutputDirectory
        });
        context.logger.info(
            chalk.green(`Wrote imported definition at ${path.relative(process.cwd(), absolutePathToOutputDirectory)}`)
        );
    }
}

async function writeDefinitionForOpenAPIWorkspace({
    workspace,
    context
}: {
    workspace: OpenAPIWorkspace;
    context: TaskContext;
}): Promise<void> {
    const fernWorkspace = await convertOpenApiWorkspaceToFernWorkspace(workspace, context);
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
        await writeFile(
            absoluteFilepath,
            await formatDefinitionFile({
                fileContents: yaml.dump(definitionFile.contents)
            })
        );
    }
}
