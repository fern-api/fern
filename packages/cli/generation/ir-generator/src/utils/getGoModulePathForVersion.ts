/**
 * Mirrors the Go generator's version handling (`generators/go/internal/cmd/cmd.go`): the version is
 * prefixed with `v` if missing, its major is parsed with `golang.org/x/mod/semver`, and from `v2` on
 * the `/vN` suffix is joined onto the module path unless the path already ends in that exact segment.
 * Returns the module path the generator will emit so CLI-stamped values (e.g. `User-Agent`) match
 * `X-Fern-SDK-Name`.
 */
export function getGoModulePathForVersion(modulePath: string, version: string | undefined): string {
    if (version == null) {
        return modulePath;
    }
    const major = parseGoSemverMajor(version.startsWith("v") ? version : `v${version}`);
    if (major == null || major === "v0" || major === "v1") {
        return modulePath;
    }
    return modulePath.split("/").at(-1) === major ? modulePath : `${modulePath}/${major}`;
}

// Port of golang.org/x/mod/semver's `Major`: returns `vN` for a valid `vMAJOR[.MINOR[.PATCH]][-pre][+build]`
// string, or undefined if the version is not valid semver.
function parseGoSemverMajor(version: string): string | undefined {
    if (!version.startsWith("v")) {
        return undefined;
    }
    let rest = version.slice(1);
    const major = takeNumericIdentifier(rest);
    if (major == null) {
        return undefined;
    }
    rest = rest.slice(major.length);
    for (let i = 0; i < 2 && rest.startsWith("."); i++) {
        const part = takeNumericIdentifier(rest.slice(1));
        if (part == null) {
            return undefined;
        }
        rest = rest.slice(1 + part.length);
    }
    if (rest.startsWith("-")) {
        const prerelease = takeIdentifiers(rest.slice(1), true);
        if (prerelease == null) {
            return undefined;
        }
        rest = rest.slice(1 + prerelease.length);
    }
    if (rest.startsWith("+")) {
        const build = takeIdentifiers(rest.slice(1), false);
        if (build == null) {
            return undefined;
        }
        rest = rest.slice(1 + build.length);
    }
    return rest.length === 0 ? `v${major}` : undefined;
}

function takeNumericIdentifier(input: string): string | undefined {
    const match = /^\d+/.exec(input);
    if (match == null) {
        return undefined;
    }
    const digits = match[0];
    if (digits.length > 1 && digits.startsWith("0")) {
        return undefined;
    }
    return digits;
}

function takeIdentifiers(input: string, isPrerelease: boolean): string | undefined {
    const match = /^[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*/.exec(input);
    if (match == null) {
        return undefined;
    }
    if (isPrerelease) {
        for (const identifier of match[0].split(".")) {
            if (/^\d+$/.test(identifier) && identifier.length > 1 && identifier.startsWith("0")) {
                return undefined;
            }
        }
    }
    return match[0];
}
