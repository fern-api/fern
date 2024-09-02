import { getFernDirectory } from "@fern-api/configuration";
import { Directory, File, getDirectoryContents } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
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

        const fernDirectoryContents = await getDirectoryContents(absolutePathToFernDirectory);

        const files: File[] = [];
        const directories: Directory[] = [];
        for (const fileOrFolder of fernDirectoryContents) {
            if (fileOrFolder.type === "directory") {
                directories.push(fileOrFolder);
            } else {
                files.push(fileOrFolder);
            }
        }

        const apisDirectory = directories.find((dir) => dir.name === "apis");
        if (apisDirectory != null) {
            // Single workspace
            addApiConfigurationToSingleWorkspace();
        } else {
            // Multiple workspaces
        }
    }
};

export async function addApiConfigurationToSingleWorkspace({
    context,
    files,
    directories
}: {
    context: TaskContext;
    files: File[];
    directories: Directory[];
}): Promise<void> {
    const existingGeneratorsYml = files.find(
        (file) => file.name === "generators.yml" || file.name === "generators.yaml"
    );
    const definitionDirectory = directories.find((dir) => dir.name === "definition");
    const openapiDirectory = directories.find((dir) => dir.name === "openapi");

    if (existingGeneratorsYml == null) {
        if (definitionDirectory != null) {
            // pass
        } else if (openapiDirectory != null) {
            // add
        }
    } else {
        const apiConfiguration = yaml.loads(existingGeneratorsYml.contents);
        if (apiConfiguration["api"] != null) {
            // pass
        } else if (openapiDirectory != null) {
        }
    }
}
