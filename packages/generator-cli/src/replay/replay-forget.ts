import { type DiffStat, type ForgetOptions, type ForgetResult, forget, type MatchedPatch } from "@fern-api/replay";

export type { DiffStat, ForgetOptions, ForgetResult, MatchedPatch };

export interface ReplayForgetParams {
    /** Directory containing the SDK (where .fern/replay.lock lives) */
    outputDir: string;
    /** Options controlling which patches to forget */
    options?: ForgetOptions;
}

export function replayForget(params: ReplayForgetParams): ForgetResult {
    return forget(params.outputDir, params.options);
}
