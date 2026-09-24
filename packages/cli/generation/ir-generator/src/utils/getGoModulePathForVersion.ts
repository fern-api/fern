const MAJOR_VERSION_REGEX = /^v?(\d+)(?:[.\-+]|$)/;
const MAJOR_VERSION_SUFFIX_REGEX = /\/v\d+$/;

/**
 * Mirrors the Go generator's `maybeAppendVersionSuffix`: from major version 2 on, Go
 * requires the module path to carry a `/vN` suffix, so the generator appends it to the
 * module path and every import path. Returns the module path the generator will emit for
 * the given version so CLI-stamped values (e.g. `User-Agent`) match `X-Fern-SDK-Name`.
 */
export function getGoModulePathForVersion(modulePath: string, version: string | undefined): string {
    if (version == null || MAJOR_VERSION_SUFFIX_REGEX.test(modulePath)) {
        return modulePath;
    }
    const match = MAJOR_VERSION_REGEX.exec(version);
    if (match?.[1] == null) {
        return modulePath;
    }
    const major = Number(match[1]);
    if (major < 2) {
        return modulePath;
    }
    return `${modulePath}/v${major}`;
}
