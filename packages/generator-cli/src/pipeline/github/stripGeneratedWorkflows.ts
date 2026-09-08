import { execFileSync } from "child_process";
import { rmSync } from "fs";
import { join } from "path";

import type { PipelineLogger } from "../PipelineLogger";

export const GITHUB_WORKFLOWS_DIR = ".github/workflows";

/**
 * Makes the working tree's `.github/workflows` identical to HEAD: newly generated
 * workflow files are removed and tracked ones are restored, so subsequent commits
 * never touch workflow files. Used when `github.workflows` is disabled.
 */
export function stripGeneratedWorkflows(outputDir: string, logger: PipelineLogger): void {
    rmSync(join(outputDir, GITHUB_WORKFLOWS_DIR), { recursive: true, force: true });

    if (!hasTrackedWorkflows(outputDir)) {
        logger.debug(`Removed generated ${GITHUB_WORKFLOWS_DIR} (workflows disabled)`);
        return;
    }

    execFileSync("git", ["checkout", "HEAD", "--", GITHUB_WORKFLOWS_DIR], { cwd: outputDir, stdio: "pipe" });
    logger.debug(`Restored ${GITHUB_WORKFLOWS_DIR} from HEAD (workflows disabled)`);
}

function hasTrackedWorkflows(outputDir: string): boolean {
    try {
        const output = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD", "--", GITHUB_WORKFLOWS_DIR], {
            cwd: outputDir,
            stdio: "pipe"
        });
        return output.toString().trim().length > 0;
    } catch {
        // No HEAD yet (empty repository) — nothing to restore.
        return false;
    }
}
