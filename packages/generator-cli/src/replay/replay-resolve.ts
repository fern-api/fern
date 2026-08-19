import { type ResolveOptions, type ResolveResult, resolve } from "@fern-api/replay";

export type { ResolveOptions, ResolveResult };

export interface ReplayResolveParams {
    /** Directory containing the SDK (where .fern/replay.lock lives) */
    outputDir: string;
    /** Check for remaining conflict markers before committing. Default: true */
    checkMarkers?: boolean;
}

export async function replayResolve(params: ReplayResolveParams): Promise<ResolveResult> {
    return resolve(params.outputDir, {
        checkMarkers: params.checkMarkers
    });
}
