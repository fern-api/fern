import { type AbsoluteFilePath, dirname, getFilename, join, RelativeFilePath } from "@fern-api/fs-utils";

export type SplitFormat = "overrides" | "overlays";

/**
 * Derives an override output path from a spec file path.
 * E.g., `/path/to/openapi.yml` → `/path/to/openapi-overrides.yml`
 */
export function deriveOutputPath(specPath: AbsoluteFilePath, format: SplitFormat = "overlays"): AbsoluteFilePath {
    const specFilename = getFilename(specPath);
    const suffix = format === "overlays" ? "overlays" : "overrides";
    let derivedFilename = `openapi-${suffix}.yml`;
    if (specFilename != null) {
        const lastDotIndex = specFilename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            const nameWithoutExt = specFilename.substring(0, lastDotIndex);
            derivedFilename = `${nameWithoutExt}-${suffix}.yml`;
        }
    }
    return join(dirname(specPath), RelativeFilePath.of(derivedFilename));
}
