import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";

import { getBundleCacheDir, maybeBundleMdxComponent } from "./utils/bundleMdxComponent.js";
import { collectMdxComponentFiles } from "./utils/collectMdxComponentFiles.js";

/**
 * Bundles every `experimental.mdx-components` file that imports third-party
 * libraries, populating the bundle cache (`FERN_MDX_BUNDLE_CACHE_DIR`) so a
 * later `fern generate` reuses the output instead of invoking rolldown — which
 * needs network — itself.
 *
 * Returns the number of components that were bundled.
 */
export async function bundleMdxComponents({
    absolutePathToDocsWorkspace,
    mdxComponents,
    context
}: {
    absolutePathToDocsWorkspace: AbsoluteFilePath;
    mdxComponents: readonly string[];
    context: TaskContext;
}): Promise<number> {
    const cacheDir = getBundleCacheDir();
    if (cacheDir == null) {
        context.logger.debug("Skipping MDX component bundling: no bundle cache directory is configured.");
        return 0;
    }
    context.logger.debug(`Writing MDX component bundles to ${cacheDir}`);

    const filePaths = await collectMdxComponentFiles({ absolutePathToDocsWorkspace, mdxComponents });

    const bundled = await Promise.all(
        filePaths.map(async (absoluteFilePath) => {
            const contents = (await readFile(absoluteFilePath)).toString();
            return await maybeBundleMdxComponent({ absoluteFilePath, contents, context });
        })
    );

    return bundled.filter((result) => result != null).length;
}
