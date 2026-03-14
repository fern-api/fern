import { getLatestVersionFromNpm, RegistryInfo } from "@fern-api/api-workspace-commons";
import semver from "semver";

const PREVIEW_REGISTRY_URL = process.env.FERN_PREVIEW_REGISTRY_URL ?? "https://npm.buildwithfern.com";
const DEFAULT_BASE_VERSION = "0.0.1";

/**
 * Computes a preview version for an SDK package.
 *
 * Strategy:
 * 1. Fetch the latest published version from the **public** npm registry (no auth).
 *    Private or unpublished packages will fall back to 0.0.1.
 * 2. Increment patch to get the next version
 * 3. Append `-preview.{previewId}.{timestamp}` suffix for uniqueness
 *
 * Example: if latest published is 1.3.0, preview version is
 * 1.3.1-preview.feat-add-auth.1710434700
 *
 * Note: Uses the public npm registry only (no auth token). If the customer's
 * package is private or hasn't been published yet, the base version defaults
 * to 0.0.1. This is an intentional v1 limitation.
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

    const timestamp = Math.floor(Date.now() / 1000);
    return `${baseVersion}-preview.${previewId}.${timestamp}`;
}

export { PREVIEW_REGISTRY_URL };
