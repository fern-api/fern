import { getLatestVersionFromNpm, RegistryInfo } from "@fern-api/api-workspace-commons";
import semver from "semver";

const PREVIEW_REGISTRY_URL = "https://npm.buildwithfern.com";
const DEFAULT_BASE_VERSION = "0.0.1";

/**
 * Computes a preview version for an SDK package.
 *
 * Strategy:
 * 1. Fetch the latest published version from the public npm registry
 * 2. Increment patch to get the next version
 * 3. Append `-preview.{previewId}.1` suffix
 *
 * Example: if latest published is 1.3.0, preview version is 1.3.1-preview.feat-add-auth.1
 */
export async function computePreviewVersion({
    packageName,
    previewId
}: {
    packageName: string;
    previewId: string;
}): Promise<string> {
    const latestVersion = await getLatestVersionFromNpm(packageName, RegistryInfo.Empty);

    let baseVersion: string;
    if (latestVersion != null) {
        const nextPatch = semver.inc(latestVersion, "patch");
        baseVersion = nextPatch ?? DEFAULT_BASE_VERSION;
    } else {
        baseVersion = DEFAULT_BASE_VERSION;
    }

    return `${baseVersion}-preview.${previewId}.1`;
}

export { PREVIEW_REGISTRY_URL };
