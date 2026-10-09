import { APIS_DIRECTORY, DEFAULT_API_WORKSPACE_FOLDER_NAME } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { rename } from "fs/promises";
import path from "path";
import { getSpecPaths, renameSpecs } from "./docsYmlSpecs.js";
import { findFreeFileName } from "./initializeDocs.js";
import { updateDocsYml } from "./updateDocsYml.js";

/** The specs `fern init` writes into the fern directory, and moves into `apis/api/` when it makes room for a second API. */
const SPEC_FILENAMES = ["openapi.yml", "openapi.json"];

/**
 * `fern init` writes the spec of a new API as `openapi.yml|json` in the fern directory, replacing a file of that name.
 * If `docs.yml` reads such a file, it is the docs' own copy of a spec, so give it a free name and point `docs.yml`
 * at it first. Both specs are then kept.
 */
export async function preserveDocsSpecs({
    absolutePathToFernDirectory,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<void> {
    const existingFilenames = await filterAsync(SPEC_FILENAMES, (filename) =>
        doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(filename)))
    );
    // Nothing can be overwritten, so there is no reason to read docs.yml.
    if (existingFilenames.length === 0) {
        return;
    }
    await updateDocsYml({
        absolutePathToFernDirectory,
        taskContext,
        update: async (docsConfig) => {
            const specPathsInDocs = getSpecPaths(docsConfig).map((specPath) => path.normalize(specPath));
            const renames = new Map<string, string>();
            for (const filename of existingFilenames.filter((existing) => specPathsInDocs.includes(existing))) {
                const freeFilename = await findFreeFileName({
                    directory: absolutePathToFernDirectory,
                    fileName: filename
                });
                await rename(
                    join(absolutePathToFernDirectory, RelativeFilePath.of(filename)),
                    join(absolutePathToFernDirectory, RelativeFilePath.of(freeFilename))
                );
                renames.set(filename, `./${freeFilename}`);
            }
            return renameSpecs({ docsConfig, renames });
        }
    });
}

/**
 * When `fern init` moves an API into `apis/api/`, a `docs.yml` that read its spec from the fern directory would point
 * at a file that is gone. This points it at the new location.
 */
export async function repointRelocatedSpecs({
    absolutePathToFernDirectory,
    taskContext
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<void> {
    const renames = await getRelocatedSpecs({ absolutePathToFernDirectory });
    if (renames.size > 0) {
        await updateDocsYml({
            absolutePathToFernDirectory,
            taskContext,
            update: (docsConfig) => renameSpecs({ docsConfig, renames })
        });
    }
}

/** Maps the normalized old path of each spec that is gone from the fern directory but present in `apis/api/`. */
async function getRelocatedSpecs({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<Map<string, string>> {
    const relocatedDirectory = join(
        absolutePathToFernDirectory,
        RelativeFilePath.of(APIS_DIRECTORY),
        RelativeFilePath.of(DEFAULT_API_WORKSPACE_FOLDER_NAME)
    );
    const renames = new Map<string, string>();
    for (const filename of SPEC_FILENAMES) {
        const wasRelocated =
            !(await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(filename)))) &&
            (await doesPathExist(join(relocatedDirectory, RelativeFilePath.of(filename))));
        if (wasRelocated) {
            renames.set(filename, `./${APIS_DIRECTORY}/${DEFAULT_API_WORKSPACE_FOLDER_NAME}/${filename}`);
        }
    }
    return renames;
}

async function filterAsync<T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<T[]> {
    const results = await Promise.all(items.map(predicate));
    return items.filter((_, index) => results[index]);
}
