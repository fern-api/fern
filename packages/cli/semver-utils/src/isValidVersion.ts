import { parseVersion } from "./parseVersion.js";

/**
 * Returns whether `versionString` is a version the CLI understands (a release
 * like `5.45.0`, or a prerelease like `5.45.0-rc0` / `-alpha0` / `-beta0`).
 * Uses the same parser as version comparison, so anything this accepts can be
 * ordered by {@link isVersionAhead}.
 */
export function isValidVersion(versionString: string): boolean {
    try {
        parseVersion(versionString);
        return true;
    } catch {
        return false;
    }
}
