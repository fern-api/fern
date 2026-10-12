import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration-loader";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { isDeepStrictEqual } from "util";

/**
 * Rewrites the `docs.yml` of the fern directory, if there is one, with what `update` returns for its content.
 * Rewriting drops the comments of `docs.yml`, so it is only written when `update` changed something.
 * A `docs.yml` that cannot be parsed is left unchanged, with a warning.
 * Returns whether `docs.yml` was rewritten.
 */
export async function updateDocsYml({
    absolutePathToFernDirectory,
    taskContext,
    update
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
    update: (docsConfig: unknown) => unknown | Promise<unknown>;
}): Promise<boolean> {
    const docsYmlPath = join(absolutePathToFernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(docsYmlPath))) {
        return false;
    }
    const parsed = await parseYaml({ filepath: docsYmlPath, taskContext });
    if (parsed == null) {
        return false;
    }
    const { content: docsConfig } = parsed;
    const updatedDocsConfig = await update(docsConfig);
    if (isDeepStrictEqual(updatedDocsConfig, docsConfig)) {
        return false;
    }
    await writeFile(docsYmlPath, yaml.dump(updatedDocsConfig));
    return true;
}

/** `undefined` when the file cannot be parsed. The content of an empty file is `undefined`. */
async function parseYaml({
    filepath,
    taskContext
}: {
    filepath: AbsoluteFilePath;
    taskContext: TaskContext;
}): Promise<{ content: unknown } | undefined> {
    try {
        return { content: yaml.load(await readFile(filepath, "utf8")) };
    } catch (error) {
        taskContext.logger.warn(
            `${filepath} was left unchanged because it could not be parsed: ${extractErrorMessage(error)}`
        );
        return undefined;
    }
}
