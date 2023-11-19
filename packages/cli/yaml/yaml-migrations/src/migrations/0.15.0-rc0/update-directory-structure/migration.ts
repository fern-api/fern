import {
    AbsoluteFilePath,
    Directory,
    doesPathExist,
    getDirectoryContents,
    join,
    RelativeFilePath,
} from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { Migration } from "../../../types/Migration";
import { migrateDocsAndSingleAPI } from "./migrateDocsAndSingleAPI";
import { migrateOnlyMultipleAPIs } from "./migrateOnlyMultipleAPIs";
import { migrateOnlySingleAPI } from "./migrateOnlySingleAPI";

const DOCS_YML = "docs.yml";

export const migration: Migration = {
    name: "flatten-fern-directory-structure",
    summary: "Flattens your fern directory structure. If you have one API, you no longer need an API folder.",
    run: async ({ context }) => {
        const absolutePathToFernDirectory = await getFernDirectory();
        if (absolutePathToFernDirectory == null) {
            context.failAndThrow("Fern directory not found. Failed to run migration");
            return;
        }
        const fernDirectoryContents = await getDirectoryContents(absolutePathToFernDirectory);

        const workspaces: Directory[] = [];
        for (const fileOrFolder of fernDirectoryContents) {
            if (fileOrFolder.type === "directory") {
                workspaces.push(fileOrFolder);
            }
        }

        // Nothing to migrate if no workspaces present
        if (workspaces.length === 0) {
            return;
        }

        // Migrate single workspace
        if (workspaces.length === 1 && workspaces[0] != null) {
            const absolutePathToWorkspace = join(absolutePathToFernDirectory, RelativeFilePath.of(workspaces[0].name));
            const hasDocs = await doesPathExist(getPathToDocsYaml({ absolutePathToWorkspace }));
            if (hasDocs) {
                await migrateDocsAndSingleAPI({ absolutePathToFernDirectory, absolutePathToWorkspace });
            } else {
                await migrateOnlySingleAPI({ absolutePathToFernDirectory, absolutePathToWorkspace });
            }
            return;
        }

        // Migrate multiple workspace
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const workspacesContainingDocs = workspaces.filter(async (workspace) => {
            return workspace.contents.find((fileOrDirectory) => {
                return fileOrDirectory.type === "file" && fileOrDirectory.name === "docs.yml";
            });
        });

        if (workspacesContainingDocs.length === 0) {
            await migrateOnlyMultipleAPIs({
                absolutePathToFernDirectory,
                workspaces: workspaces.map((workspace) => workspace.name),
            });
            return;
        }

        if (workspacesContainingDocs.length > 1) {
            context.failAndThrow(
                "Detected multiple docs websites being published. This is unsupported in the latest upgrade. File an issue (https://github.com/fern-api/fern) if this is important!"
            );
            return;
        }
    },
};

export function getPathToDocsYaml({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, RelativeFilePath.of(DOCS_YML));
}

const FERN_DIRECTORY = "fern";
async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
