import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { join, resolve } from "path";
import type { Context } from "../../../context/Context.js";
import type { Task } from "../../../ui/Task.js";
import type { Target } from "../../config/Target.js";

interface GitOutput {
    pullRequestUrl?: string;
    commitHash?: string;
    branchUrl?: string;
    releaseUrl?: string;
}

export function resolveTargetOutput({
    context,
    task,
    target,
    preview,
    outputPath
}: {
    context: Context;
    task: Task;
    target: Target;
    preview: boolean | undefined;
    outputPath: AbsoluteFilePath | undefined;
}): string[] | undefined {
    if (preview) {
        // For explicit preview mode, report the user-facing preview path.
        const previewPath =
            outputPath != null
                ? resolve(context.cwd, outputPath)
                : join(context.cwd, RelativeFilePath.of(`.fern/preview`));
        return [previewPath.toString()];
    }
    const gitOutput = extractGitOutputFromTaskLogs(task);
    if (gitOutput != null) {
        if (gitOutput.pullRequestUrl != null) {
            return [gitOutput.pullRequestUrl];
        }
        if (gitOutput.releaseUrl != null) {
            return [gitOutput.releaseUrl];
        }
        if (gitOutput.branchUrl != null) {
            return [gitOutput.branchUrl];
        }
    }
    // Fall back to target config (repo URL or local path).
    return context.resolveTargetOutputs(target);
}

/**
 * Extract git output URLs from task logs.
 *
 * The remote generation service logs messages like:
 *  - "Created pull request: https://github.com/owner/repo/pull/123"
 *  - "Created commit abc123"
 *  - "Pushed branch: https://github.com/owner/repo/tree/branch-name"
 *  - "Release tagged. View here: https://github.com/owner/repo/releases/tag/v1.0.0"
 */
function extractGitOutputFromTaskLogs(task: Task): GitOutput | undefined {
    const gitOutput: GitOutput = {};
    for (const log of task.logs ?? []) {
        const prMatch = log.message.match(/Created pull request: (.+)/);
        if (prMatch != null) {
            gitOutput.pullRequestUrl = prMatch[1];
        }

        const commitMatch = log.message.match(/Created commit (\w+)/);
        if (commitMatch != null) {
            gitOutput.commitHash = commitMatch[1];
        }

        const branchMatch = log.message.match(/Pushed branch: (.+)/);
        if (branchMatch != null) {
            gitOutput.branchUrl = branchMatch[1];
        }

        const releaseMatch = log.message.match(/Release tagged\. View here: (.+)/);
        if (releaseMatch != null) {
            gitOutput.releaseUrl = releaseMatch[1];
        }
    }
    return Object.keys(gitOutput).length > 0 ? gitOutput : undefined;
}
