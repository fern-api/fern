import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import YAML from "yaml";

import { getFernDirectory } from "@fern-api/configuration-loader";
import {
    AbsoluteFilePath,
    Directory,
    File,
    RelativeFilePath,
    getDirectoryContents,
    join,
    relativize
} from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "require-generators-yml",
    summary: "A generators.yml file is now required if you are using OpenAPI, AsyncAPI, or gRPC.",
    run: async ({ context }) => {
        const absolutePathToFernDirectory = await getFernDirectory();
        if (absolutePathToFernDirectory == null) {
            context.failAndThrow("Fern directory not found. Failed to run migration");
            return;
        }

        const { files, directories } = await getFilesAndDirectories(absolutePathToFernDirectory);

        const apisDirectory = directories.find((dir) => dir.name === "apis");
        if (apisDirectory == null) {
            // Single workspaces
            await addApiConfigurationToSingleWorkspace({
                context,
                files,
                directories,
                absolutePathToFernDirectory,
                absoluteFilepathToWorkspace: absolutePathToFernDirectory
            });
        } else {
            // Multiple workspaces
            for (const workspace of apisDirectory.contents) {
                if (workspace.type !== "directory") {
                    continue;
                }
                const absoluteFilepathToWorkspace = join(
                    absolutePathToFernDirectory,
                    RelativeFilePath.of("apis"),
                    RelativeFilePath.of(workspace.name)
                );
                await addApiConfigurationToSingleWorkspace({
                    context,
                    ...(await getFilesAndDirectories(join(absoluteFilepathToWorkspace))),
                    absolutePathToFernDirectory,
                    absoluteFilepathToWorkspace
                });
            }
        }
    }
};

async function addApiConfigurationToSingleWorkspace({
    absolutePathToFernDirectory,
    absoluteFilepathToWorkspace,
    context,
    files,
    directories
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    absoluteFilepathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    files: File[];
    directories: Directory[];
}): Promise<void> {
    const existingGeneratorsYml = files.find(
        (file) => file.name === "generators.yml" || file.name === "generators.yaml"
    );
    const openapiDirectory = directories.find((dir) => dir.name === "openapi");

    if (existingGeneratorsYml == null) {
        if (openapiDirectory != null && openapiDirectory.contents[0] != null) {
            const absolutePathToGeneratorsYml = join(
                absoluteFilepathToWorkspace,
                RelativeFilePath.of("generators.yml")
            );
            await writeFile(
                absolutePathToGeneratorsYml,
                yaml.dump({
                    api: {
                        path: join(
                            await relativize(absolutePathToFernDirectory, absoluteFilepathToWorkspace),
                            RelativeFilePath.of(openapiDirectory.name),
                            RelativeFilePath.of(openapiDirectory.contents[0]?.name)
                        )
                    }
                })
            );
            context.logger.info(chalk.green(`Wrote ${absolutePathToGeneratorsYml}`));
        }
    } else {
        const generatorsYmlContents = yaml.load(existingGeneratorsYml.contents);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((generatorsYmlContents as any)?.api != null) {
            // api config is already defined
        } else if (openapiDirectory != null && openapiDirectory.contents[0] != null) {
            // add api config to existing generators.yml
            const parsedDocument = YAML.parseDocument(existingGeneratorsYml.contents);
            parsedDocument.set("api", {
                path: join(
                    await relativize(absolutePathToFernDirectory, absoluteFilepathToWorkspace),
                    RelativeFilePath.of(openapiDirectory.name),
                    RelativeFilePath.of(openapiDirectory.contents[0]?.name)
                )
            });
            await writeFile(existingGeneratorsYml.absolutePath, parsedDocument.toString());
            context.logger.info(chalk.green(`Updated ${existingGeneratorsYml.absolutePath}`));
        }
    }
}

async function getFilesAndDirectories(
    absoluteFilepath: AbsoluteFilePath
): Promise<{ files: File[]; directories: Directory[] }> {
    const contents = await getDirectoryContents(absoluteFilepath);

    const files: File[] = [];
    const directories: Directory[] = [];
    for (const fileOrFolder of contents) {
        if (fileOrFolder.type === "directory") {
            directories.push(fileOrFolder);
        } else {
            files.push(fileOrFolder);
        }
    }

    return { files, directories };
}
