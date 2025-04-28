import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../../cli-context/CliContext";

export async function getSdkVersion({
    project,
    context,
    from
}: {
    project: Project;
    context: CliContext;
    from: string;
}): Promise<void> {
    if (!isGitSha({ value: from })) {
        context.failAndThrow(`Invalid --from argument: ${from}; expected a valid git SHA`);
        return;
    }
    // TODO: For now, we just respond with a hard-coded version.
    context.logger.info("1.1.0");
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
