const BASE_VERSION = "0.0.1";

/**
 * Computes a preview version for an SDK package.
 *
 * Uses a fixed base version (0.0.1) with a prerelease suffix for uniqueness.
 * Preview packages are published to a private registry (npm.buildwithfern.com),
 * so there's no need to query for the latest version — the timestamp ensures
 * each preview is unique.
 *
 * Format: 0.0.1-{previewId}.{timestamp}
 * Example: 0.0.1-feat-add-auth.1710434700
 */
export function computePreviewVersion({ previewId }: { previewId: string }): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${BASE_VERSION}-${previewId}.${timestamp}`;
}
