import { cloneRepository } from "@fern-api/github";
import {
    type GenerationLock,
    LockfileManager,
    type StatusGeneration,
    type StatusPatch,
    status
} from "@fern-api/replay";
import tmp from "tmp-promise";

export interface ReplayStatusRemoteParams {
    /** GitHub repo URI (e.g., "owner/repo") */
    githubRepo: string;
    /** GitHub token */
    token: string;
    /** Target branch (defaults to repo default branch) */
    branch?: string;
}

export interface ReplayStatusRemoteResult {
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
 * Get Replay status from a remote GitHub repository.
 * Clones the repo into a temp directory, runs status, then cleans up.
 */
export async function replayStatusRemote(params: ReplayStatusRemoteParams): Promise<ReplayStatusRemoteResult> {
    const { githubRepo, token } = params;

    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    try {
        const repository = await cloneRepository({
            githubRepository: githubRepo,
            installationToken: token,
            targetDirectory: tmpDir.path
        });

        const repoPath = tmpDir.path;

        // Checkout target branch if specified
        if (params.branch != null) {
            const branchExists = await repository.remoteBranchExists(params.branch);
            if (branchExists) {
                await repository.checkoutRemoteBranch(params.branch);
            }
        }

        const statusResult = status(repoPath);

        if (!statusResult.initialized) {
            return {
                initialized: false,
                patches: [],
                lastGeneration: undefined,
                generationsCount: 0,
                fullLock: null
            };
        }

        const lockManager = new LockfileManager(repoPath);
        const lock = lockManager.read();

        return {
            initialized: true,
            patches: statusResult.patches,
            lastGeneration: statusResult.lastGeneration,
            generationsCount: lock.generations.length,
            fullLock: lock
        };
    } finally {
        await tmpDir.cleanup();
    }
}
