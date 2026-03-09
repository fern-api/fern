import latestVersion from "latest-version";

import { CliEnvironment } from "../CliEnvironment.js";
import { readCache, writeCache } from "./CliCache.js";

const LATEST_VERSION_CACHE_KEY = "latest-cli-version";
const LATEST_PRERELEASE_VERSION_CACHE_KEY = "latest-cli-prerelease-version";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    // when running a non-prod version of the CLI (e.g. dev-cli in ETE tests),
    // don't try to upgrade
    if (cliEnvironment.packageName !== "fern-api") {
        return cliEnvironment.packageVersion;
    }

    const cacheKey = includePreReleases ? LATEST_PRERELEASE_VERSION_CACHE_KEY : LATEST_VERSION_CACHE_KEY;
    const cached = readCache<string>(cacheKey, CACHE_TTL_MS);
    if (cached != null) {
        return cached;
    }

    const version = await latestVersion(cliEnvironment.packageName, {
        version: includePreReleases ? "prerelease" : "latest"
    });

    writeCache(cacheKey, version);
    return version;
}
