import semver from "semver";

export type PublishType = "dev" | "prerelease" | "ga";

/**
 * Determines the publish type for a CLI version.
 *
 * - "dev" when explicitly flagged as a dev release
 * - "prerelease" for any SemVer prerelease (e.g. 5.9.0-rc.0, 5.9.0-alpha.0, 5.9.0-beta.3, 5.9.0-next.42)
 * - "ga" for stable releases (e.g. 5.9.0)
 *
 * NOTE: The "prerelease" type maps to the `publishRc` config key in seed.yml.
 * The key is named `publishRc` for historical reasons but handles all prerelease identifiers.
 */
export function getPublishType({
    version,
    isDevRelease
}: {
    version: string;
    isDevRelease: boolean | undefined;
}): PublishType {
    if (isDevRelease) {
        return "dev";
    }

    const parsed = semver.parse(version);
    if (parsed != null && parsed.prerelease.length > 0) {
        return "prerelease";
    }

    return "ga";
}
