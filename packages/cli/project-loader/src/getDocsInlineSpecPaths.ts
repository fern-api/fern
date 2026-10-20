import path from "node:path";

import { resolveFilepath } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { getDocsApiSectionsWithInlineSpecs } from "./getDocsApiSectionsWithInlineSpecs.js";

/**
 * Absolute paths of every spec file that docs.yml references inline via `specs`.
 */
export function getDocsInlineSpecPaths({
    navigation,
    absoluteFilepathToDocsConfig
}: {
    navigation: unknown;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): AbsoluteFilePath[] {
    return getDocsApiSectionsWithInlineSpecs(navigation).flatMap((section) =>
        (section.specs ?? []).map((spec) => resolveFilepath(spec.path, absoluteFilepathToDocsConfig))
    );
}

export function isDirectoryReferencedBySpecs(directory: AbsoluteFilePath, specPaths: AbsoluteFilePath[]): boolean {
    return specPaths.some((specPath) => {
        const relativePath = path.relative(directory, specPath);
        return !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
    });
}
