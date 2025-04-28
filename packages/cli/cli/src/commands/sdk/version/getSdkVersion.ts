import semver from "semver";

import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../../cli-context/CliContext";

export async function getSdkVersion({
    project,
    context,
    group,
    from,
    currentVersion
}: {
    project: Project;
    context: CliContext;
    group: string;
    from: string;
    currentVersion: string;
}): Promise<void> {
    if (!isGitSha({ value: from })) {
        context.failAndThrow(`Invalid --from argument: ${from}; expected a valid git SHA`);
        return;
    }
    // TODO: For now, we always bump the minor version.
    const nextVersion = semver.inc(currentVersion, "minor");
    if (!nextVersion) {
        context.failAndThrow(`Invalid current version: ${currentVersion}`);
        return;
    }
    context.logger.info(nextVersion);
    return;
}

/**
 * Checks if a string matches the pattern of a git SHA.
 */
function isGitSha({ value, allowShort = true }: { value: string; allowShort?: boolean }): boolean {
    if (/^[0-9a-f]{40}$/i.test(value)) {
        return true;
    }
    if (allowShort && /^[0-9a-f]{7,10}$/i.test(value)) {
        return true;
    }
    return false;
}
