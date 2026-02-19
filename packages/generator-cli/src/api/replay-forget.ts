import { type ForgetResult, forget } from "@fern-api/replay";

export type { ForgetResult };

export interface ReplayForgetParams {
    outputDir: string;
    pattern: string;
    dryRun?: boolean;
}

/**
 * Remove patches matching a file path or glob pattern.
 * The next regeneration will NOT replay these patches.
 */
export function replayForget(params: ReplayForgetParams): ForgetResult {
    const { outputDir, pattern, dryRun } = params;
    return forget(outputDir, pattern, { dryRun });
}
