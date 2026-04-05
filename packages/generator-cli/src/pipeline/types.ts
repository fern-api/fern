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

export interface PipelineContext {
    previousStepResults: {
        replay?: ReplayStepResult;
        fernignore?: FernignoreStepResult;
    };
}

export interface ReplayStepConfig {
    enabled: boolean;
    stageOnly?: boolean;
    skipApplication?: boolean;
}

export interface FernignoreStepConfig {
    enabled: boolean;
    customContents?: string;
}

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
    /** User-facing changelog entry for PR body. When present, used instead of commit message body. */
    changelogEntry?: string;
    /** Structured PR description with Before/After code fences for breaking changes. Takes priority over changelogEntry for PR body. */
    prDescription?: string;
    /** One-sentence justification for WHY the version bump was chosen. Prepended to PR body when present. */
    versionBumpReason?: string;
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
    };
}

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
    baseBranchHead?: string;
    unresolvedPatches?: Array<{
        patchId: string;
        patchMessage: string;
        files: string[];
        conflictDetails: Array<{
            file: string;
            conflictReason?: string;
        }>;
    }>;
    warnings?: string[];
}

export interface FernignoreStepResult extends StepResult {
    pathsPreserved?: string[];
}

export interface GithubStepResult extends StepResult {
    commitSha?: string;
    branchUrl?: string;
    prUrl?: string;
    prNumber?: number;
    updatedExistingPr?: boolean;
    generationBaseTagSha?: string;
}

export interface StepResult {
    executed: boolean;
    success: boolean;
    errorMessage?: string;
}
