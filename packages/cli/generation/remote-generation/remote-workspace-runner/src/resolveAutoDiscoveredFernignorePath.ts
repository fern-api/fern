import { FERNIGNORE_FILENAME, generatorsYml } from "@fern-api/configuration";
import { doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

/**
 * If the generator is configured with local file system output (absolutePathToLocalOutput),
 * checks whether a .fernignore file exists in that output directory and returns its path.
 * Returns undefined if the generator has no local output path or no .fernignore file exists.
 */
export async function resolveAutoDiscoveredFernignorePath({
    generatorInvocation,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
}): Promise<string | undefined> {
    if (generatorInvocation.absolutePathToLocalOutput == null) {
        return undefined;
    }
    const fernignoreFilePath = join(
        generatorInvocation.absolutePathToLocalOutput,
        RelativeFilePath.of(FERNIGNORE_FILENAME)
    );
    if (await doesPathExist(fernignoreFilePath)) {
        context.logger.debug(`Auto-discovered ${FERNIGNORE_FILENAME} at ${fernignoreFilePath}`);
        return fernignoreFilePath;
    }
    return undefined;
}
