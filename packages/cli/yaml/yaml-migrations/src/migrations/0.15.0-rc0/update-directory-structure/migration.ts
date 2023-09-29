import {
    AbsoluteFilePath,
    Directory,
    doesPathExist,
    FileOrDirectory,
    getDirectoryContents,
    join,
    moveFolder,
    RelativeFilePath
} from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { findUp } from "find-up";
import { mkdir, readFile, rename } from "fs/promises";
import yaml from "js-yaml";
import { Migration } from "../../../types/Migration";
import { GeneratorsConfigurationSchema } from "./generators-config-schemas/GeneratorsConfigurationSchema";

const WORKSPACE_TYPE = (
    SINGLE_API = "single",
);

export const migration: Migration = {
    name: "flatten-fern-directory-structure",
    summary: "Flattens your fern directory structure. If you have one API, you no longer need an API folder.",
    run: async ({ context }) => {
        const fernDirectory = await getFernDirectory();
        if (fernDirectory == null) {
            context.failAndThrow("Fern directory not found. Failed to run migration");
            return;
        }
        const fernDirectoryContents = await getDirectoryContents(fernDirectory);
    },
};


/**
 * How to do migrations: 
 * Single API, No Docs (move api upwards)
 * Single API, Docs (move api upwards, unnest docs.yml)
 * Multiple APIs, No Docs (nest apis within a `apis` folder)
 * Multipe APIs, Docs (nest apis with a `apis` folder, unnest docs.yml)
 */

const FERN_DIRECTORY = "fern";

async function migrateOneAPI({
    context,
    apiFolder,
    fernFolder,
}: {
    context: TaskContext;
    apiFolder: Directory;
    fernFolder: AbsoluteFilePath;
}): Promise<void> {
    await moveFolder({
        src: join(fernFolder, RelativeFilePath.of(apiFolder.name)),
        dest: fernFolder,
    });

    const docsYmlPath = join(fernFolder, RelativeFilePath.of("docs"), RelativeFilePath.of("docs.yml"));
    const updatedDocsYmlPath = join(fernFolder, RelativeFilePath.of("docs.yml"));

    const generatorsYml = join(fernFolder, RelativeFilePath.of("generators.yml"));

    const docsYmlExists = await doesPathExist(docsYmlPath);
    if (docsYmlExists) {
        await rename(docsYmlPath, updatedDocsYmlPath);
        const generatorsYmlString = await readFile(generatorsYml);
        const generatorsYmlJson = await yaml.load(generatorsYmlString.toString());
        const generatorsConfig = GeneratorsConfigurationSchema.parse(generatorsYmlJson);

        const docsYmlContents = await readFile(updatedDocsYmlPath);
    }
}

async function migrateMoreThanOneAPI({
    context,
    fernFolder,
    fernFolderContents,
}: {
    context: TaskContext;
    fernFolder: AbsoluteFilePath;
    fernFolderContents: FileOrDirectory[];
}): Promise<void> {
    const apisFolder = join(fernFolder, RelativeFilePath.of("apis"));
    await mkdir(apisFolder);
    for (const legacyApiFolder of fernFolderContents) {
        if (legacyApiFolder.type === "directory") {
            await moveFolder({
                src: join(fernFolder, RelativeFilePath.of(legacyApiFolder.name)),
                dest: join(apisFolder, RelativeFilePath.of(legacyApiFolder.name)),
            });
        }
    }
}

function convertGeneratorsConfiguration(generatorsConfiguration: GeneratorsConfigurationSchema) {
    const;
    for (const [groupName, groupValue] of Object.entries(generatorsConfiguration.groups ?? {})) {
        if (groupValue.docs != null) {
            groupValue.docs.domain;
        }
    }
}

async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
