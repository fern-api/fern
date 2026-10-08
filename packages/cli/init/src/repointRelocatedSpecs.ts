import {
    APIS_DIRECTORY,
    DEFAULT_API_WORKSPACE_FOLDER_NAME,
    DOCS_CONFIGURATION_FILENAME
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { isDeepStrictEqual } from "util";
import { renameSpecs } from "./docsYmlSpecs.js";

/** The specs `fern init` moves into `apis/api/` when it makes room for a second API. */
const RELOCATABLE_SPEC_FILENAMES = ["openapi.yml", "openapi.json"];

/**
 * When `fern init` moves an API into `apis/api/`, a `docs.yml` that read its spec from the fern directory would point
 * at a file that is gone. This points it at the new location.
 */
export async function repointRelocatedSpecs({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<void> {
    const docsYmlPath = join(absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(docsYmlPath))) {
        return;
    }
    const renames = await getRelocatedSpecs({ absolutePathToFernDirectory });
    if (renames.size === 0) {
        return;
    }
    const docsConfig: unknown = yaml.load(await readFile(docsYmlPath, "utf8"));
    const repointedDocsConfig = renameSpecs({ docsConfig, renames });
    // Rewriting drops the comments of docs.yml, so leave it alone unless a spec was moved.
    if (!isDeepStrictEqual(repointedDocsConfig, docsConfig)) {
        await writeFile(docsYmlPath, yaml.dump(repointedDocsConfig));
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
    for (const filename of RELOCATABLE_SPEC_FILENAMES) {
        const wasRelocated =
            !(await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(filename)))) &&
            (await doesPathExist(join(relocatedDirectory, RelativeFilePath.of(filename))));
        if (wasRelocated) {
            renames.set(filename, `./${APIS_DIRECTORY}/${DEFAULT_API_WORKSPACE_FOLDER_NAME}/${filename}`);
        }
    }
    return renames;
}
