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

/**
 * PEP 440 sanitization: lowercase, collapse separators to single dots,
 * strip leading/trailing dots. PEP 440's local segment allows
 * `[a-z0-9]+(?:[.-_][a-z0-9]+)*` but we restrict to dots only for
 * stricter cross-tooling compatibility.
 *
 * Examples:
 *   "feat-add-auth"   -> "feat.add.auth"
 *   "feat/add_auth"   -> "feat.add.auth"
 *   "RELEASE_BRANCH"  -> "release.branch"
 *   ""                -> "preview" (fallback)
 */
export function sanitizeForPypiLocalSegment(previewId: string): string {
    const lowered = previewId.toLowerCase();
    const collapsed = lowered.replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
    const truncated = collapsed.slice(0, 64).replace(/\.+$/, "");
    return truncated.length > 0 ? truncated : "preview";
}

/**
 * Computes a PEP 440-compliant preview version for a PyPI package.
 * Format: 0.0.1.dev{epoch}+{sanitizedPreviewId}
 * Example: 0.0.1.dev1710434700+feat.add.auth
 *
 * - dev{epoch} guarantees uniqueness across runs (PEP 440 dev release).
 * - +sanitized local segment is a human-readable hint that does not
 *   participate in version ordering, so it cannot collide.
 */
export function computePypiPreviewVersion({ previewId }: { previewId: string }): string {
    const epoch = Math.floor(Date.now() / 1000);
    const local = sanitizeForPypiLocalSegment(previewId);
    return `0.0.1.dev${epoch}+${local}`;
}
