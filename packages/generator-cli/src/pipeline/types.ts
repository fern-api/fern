/**
 * Configuration for the post-generation pipeline.
 */
export interface PipelineConfig {
    outputDir: string;

    // Step configs (optional, modular)
    replay?: ReplayStepConfig;
    fernignore?: FernignoreStepConfig; // PHASE 2: not implemented yet
    github?: GithubStepConfig;

    // Global metadata
    cliVersion?: string;
    generatorVersions?: Record<string, string>;
    generatorName?: string;
}

/**
 * Context accumulated during pipeline execution.
 * Passed to each step so downstream steps can read upstream results.
 */
export interface PipelineContext {
    previousStepResults: {
        replay?: ReplayStepResult;
        fernignore?: FernignoreStepResult;
    };
}

/**
 * Configuration for the Replay step.
 */
export interface ReplayStepConfig {
    enabled: boolean;
    stageOnly?: boolean;
    skipApplication?: boolean;
}

/**
 * Configuration for the Fernignore step (Phase 2 - future).
 */
export interface FernignoreStepConfig {
    enabled: boolean;
    customContents?: string;
}

/**
 * Configuration for the GitHub step.
 */
export interface GithubStepConfig {
    enabled: boolean;
    /** GitHub repository URI (e.g. "owner/repo") */
    uri: string;
    /** GitHub auth token */
    token: string;
    /** Output mode */
    mode: "push" | "pull-request";
    /** Target branch (base branch for PRs, push target for push mode) */
    branch?: string;
    /** Commit message for the generation */
    commitMessage?: string;
    /** Skip push/PR creation, just prepare branches locally */
    previewMode?: boolean;
    /** Generator name for namespaced fern-generation-base tag */
    generatorName?: string;
    /** Explicit override: whether replay already created commits (derived from replay context if omitted) */
    skipCommit?: boolean;
    /** Explicit override: replay conflict info (derived from replay context if omitted) */
    replayConflictInfo?: {
        previousGenerationSha: string;
        currentGenerationSha: string;
        hasConflicts: boolean;
    };
}

/**
 * Result from the post-generation pipeline execution.
 */
export interface PipelineResult {
    success: boolean;
    steps: {
        replay?: ReplayStepResult;
        fernignore?: FernignoreStepResult;
        github?: GithubStepResult;
    };
    errors?: string[];
    warnings?: string[];
}

/**
 * Result from the Replay step.
 */
export interface ReplayStepResult extends StepResult {
    flow?: "first-generation" | "no-patches" | "normal-regeneration" | "skip-application";
    patchesDetected?: number;
    patchesApplied?: number;
    patchesWithConflicts?: number;
    patchesAbsorbed?: number;
    patchesRepointed?: number;
    patchesContentRebased?: number;
    patchesKeptAsUserOwned?: number;
    previousGenerationSha?: string;
    currentGenerationSha?: string;
    conflicts?: ConflictInfo[];
    conflictDetails?: Array<{
        patchId: string;
        patchMessage: string;
        reason?: string;
        files: Array<{
            file: string;
            status: string;
            conflictReason?: string;
        }>;
    }>;
    warnings?: string[];
}

/**
 * Information about a conflict in a file.
 */
export interface ConflictInfo {
    filePath: string;
    conflicts: Array<{
        startLine: number;
        endLine: number;
        ours: string[];
        theirs: string[];
    }>;
}

/**
 * Result from the Fernignore step (Phase 2 - future).
 */
export interface FernignoreStepResult extends StepResult {
    pathsPreserved?: string[];
}

/**
 * Result from the GitHub step.
 */
export interface GithubStepResult extends StepResult {
    commitSha?: string;
    branchUrl?: string;
    prUrl?: string;
    prNumber?: number;
    updatedExistingPr?: boolean;
    generationBaseTagSha?: string;
}

/**
 * Base result interface for pipeline steps.
 */
export interface StepResult {
    executed: boolean;
    success: boolean;
    [key: string]: unknown;
}
