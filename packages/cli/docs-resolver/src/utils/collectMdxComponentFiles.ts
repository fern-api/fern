import { AbsoluteFilePath, listFiles, resolve } from "@fern-api/fs-utils";
import { stat } from "fs/promises";

const MDX_COMPONENT_EXTENSIONS = "{js,ts,jsx,tsx,md,mdx}";
const MDX_COMPONENT_EXTENSIONS_REGEX = /\.(js|ts|jsx|tsx|md|mdx)$/;

/**
 * Test files live alongside components but are not components: they import test
 * runners and other dev-only libraries that don't belong in the docs bundle.
 */
const TEST_FILE_REGEX = /(\.(test|spec)\.[^.]+$|(^|[/\\])__tests__[/\\])/;

/**
 * Resolves the `experimental.mdx-components` entries of a docs config to the
 * component files to upload. Directory entries are expanded to every component
 * file they contain; a file referenced directly is always included.
 */
export async function collectMdxComponentFiles({
    absolutePathToDocsWorkspace,
    mdxComponents
}: {
    absolutePathToDocsWorkspace: AbsoluteFilePath;
    mdxComponents: readonly string[];
}): Promise<AbsoluteFilePath[]> {
    const filePaths = new Set<AbsoluteFilePath>();

    await Promise.all(
        mdxComponents.map(async (filepath) => {
            const absoluteFilePath = resolve(absolutePathToDocsWorkspace, filepath);
            const stats = await stat(absoluteFilePath);

            if (stats.isDirectory()) {
                const files = await listFiles(absoluteFilePath, MDX_COMPONENT_EXTENSIONS);
                for (const file of files) {
                    if (!TEST_FILE_REGEX.test(file)) {
                        filePaths.add(file);
                    }
                }
            } else if (absoluteFilePath.match(MDX_COMPONENT_EXTENSIONS_REGEX) != null) {
                filePaths.add(absoluteFilePath);
            }
        })
    );

    return [...filePaths];
}
