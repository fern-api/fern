import { CliError } from "@fern-api/task-context";
import latestVersion from "latest-version";
import registryUrl from "registry-url";

import { CliEnvironment } from "../CliEnvironment.js";

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    // when running a non-prod version of the CLI (e.g. dev-cli in ETE tests),
    // or a local dev build (version 0.0.0), don't try to upgrade
    if (cliEnvironment.packageName !== "fern-api" || cliEnvironment.packageVersion === "0.0.0") {
        return cliEnvironment.packageVersion;
    }
    try {
        return await latestVersion(cliEnvironment.packageName, {
            version: includePreReleases ? "prerelease" : "latest"
        });
    } catch (error) {
        throw new CliError({
            message: getFailedToResolveLatestVersionMessage({ packageName: cliEnvironment.packageName, error }),
            code: CliError.Code.NetworkError
        });
    }
}

/**
 * `latest-version` fetches `<registry>/<package>` with Node's global `fetch`. When the
 * connection itself fails (DNS, TLS interception, proxy, VPN-only mirror) undici throws a
 * bare `TypeError: fetch failed` and hides the real reason in `error.cause`, so surface
 * both the registry that was contacted and the underlying cause.
 */
export function getFailedToResolveLatestVersionMessage({
    packageName,
    error
}: {
    packageName: string;
    error: unknown;
}): string {
    const registry = getNpmRegistryUrl(packageName);
    const reason = describeError(error);
    const cause = error instanceof Error ? describeCause(error.cause) : undefined;
    let message = `Failed to resolve latest CLI version from ${registry}${packageName}: ${reason}`;
    if (cause != null) {
        message += ` (${cause})`;
    }
    message +=
        ". Check that this machine can reach the npm registry (run `npm config get registry`), " +
        "set HTTP_PROXY/HTTPS_PROXY if you are behind a proxy, and set NODE_EXTRA_CA_CERTS if your " +
        "network uses a custom TLS certificate.";
    return message;
}

function getNpmRegistryUrl(packageName: string): string {
    try {
        return registryUrl(packageName.startsWith("@") ? packageName.split("/")[0] : undefined);
    } catch {
        return "https://registry.npmjs.org/";
    }
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function describeCause(cause: unknown): string | undefined {
    if (cause == null) {
        return undefined;
    }
    if (cause instanceof Error) {
        const code = (cause as NodeJS.ErrnoException).code;
        if (typeof code === "string" && !cause.message.includes(code)) {
            return `${code}: ${cause.message}`;
        }
        return cause.message;
    }
    return String(cause);
}
