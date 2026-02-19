import {
    type GenerationLock,
    LockfileManager,
    type StatusGeneration,
    type StatusPatch,
    type StatusResult,
    status
} from "@fern-api/replay";

export type { StatusResult, StatusPatch, StatusGeneration };

export interface ReplayStatusParams {
    outputDir: string;
}

export interface ReplayStatusResult {
    /** Whether replay is initialized (lockfile exists) */
    initialized: boolean;
    /** Tracked customization patches */
    patches: StatusPatch[];
    /** Last generation info */
    lastGeneration: StatusGeneration | undefined;
    /** Total number of generations recorded */
    generationsCount: number;
    /** Full lockfile data for detailed display (null if not initialized) */
    fullLock: GenerationLock | null;
}

/**
 * Get the current Replay status for an SDK repository.
 * Returns both the simplified status view and full lockfile data
 * for the CLI's detailed display.
 */
export function replayStatus(params: ReplayStatusParams): ReplayStatusResult {
    const { outputDir } = params;
    const statusResult = status(outputDir);

    if (!statusResult.initialized) {
        return {
            initialized: false,
            patches: [],
            lastGeneration: undefined,
            generationsCount: 0,
            fullLock: null
        };
    }

    const lockManager = new LockfileManager(outputDir);
    const lock = lockManager.read();

    return {
        initialized: true,
        patches: statusResult.patches,
        lastGeneration: statusResult.lastGeneration,
        generationsCount: lock.generations.length,
        fullLock: lock
    };
}
