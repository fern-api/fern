import { type AbsoluteFilePath, dirname, getFilename, join, RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Derives an override output path from a spec file path.
 * E.g., `/path/to/openapi.yml` → `/path/to/openapi-overrides.yml`
 */
export function deriveOutputPath(specPath: AbsoluteFilePath): AbsoluteFilePath {
    const specFilename = getFilename(specPath);
    let overridesFilename = "openapi-overrides.yml";
    if (specFilename != null) {
        const lastDotIndex = specFilename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            const nameWithoutExt = specFilename.substring(0, lastDotIndex);
            overridesFilename = `${nameWithoutExt}-overrides.yml`;
        }
    }
    return join(dirname(specPath), RelativeFilePath.of(overridesFilename));
}
