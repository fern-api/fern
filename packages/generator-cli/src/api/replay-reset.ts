import { type ResetResult, reset } from "@fern-api/replay";

export type { ResetResult };

export interface ReplayResetParams {
    outputDir: string;
    dryRun?: boolean;
}

/**
 * Reset Replay — removes replay.lock entirely.
 * User's code changes remain but will no longer be preserved across regenerations.
 */
export function replayReset(params: ReplayResetParams): ResetResult {
    const { outputDir, dryRun } = params;
    return reset(outputDir, { dryRun });
}
