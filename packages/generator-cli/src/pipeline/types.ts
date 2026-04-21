export interface PipelineConfig {
    outputDir: string;

    // Step configs (optional, modular)
    replay?: ReplayStepConfig;
    autoVersion?: AutoVersionStepConfig;
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
        autoVersion?: AutoVersionStepResult;
        fernignore?: FernignoreStepResult;
    };
}

export interface ReplayStepConfig {
    enabled: boolean;
    stageOnly?: boolean;
    skipApplication?: boolean;
}

export interface AutoVersionStepConfig {
    enabled: boolean;
    /** Generator language: typescript | python | java | go | ruby | csharp | php | swift | rust | kotlin */
    language: string;
    /** Existing changelog content passed to the AI for context. */
    priorChangelog?: string;
    /** Fallback version when no prior generation exists (first run). */
    baseVersion?: string;
    /** Fern token used to authorize the FAI (AnalyzeSdkDiff) call. */
    fernToken: string;
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
    /** One-sentence justification for WHY the version bump was chosen. Shown only for breaking changes. */
    versionBumpReason?: string;
    /** The previous SDK version before this change (e.g. "1.2.3"). Used for version header in PR body. */
    previousVersion?: string;
    /** The new SDK version after this change (e.g. "1.3.0"). Used for version header in PR body. */
    newVersion?: string;
    /** The version bump level: MAJOR, MINOR, or PATCH. Used for version header formatting. */
    versionBump?: string;
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
    /** When true: separate PRs per generation, no-diff skip, automerge support, run_id in body */
    automationMode?: boolean;
    /** Enable GitHub automerge on the PR (only effective when automationMode && !hasBreakingChanges) */
    autoMerge?: boolean;
    /** Pre-computed: version bump is MAJOR (from --version AUTO AI analysis) */
    hasBreakingChanges?: boolean;
    /** Human-readable breaking changes summary for PR body (from autoVersioningPrDescription on MAJOR) */
    breakingChangesSummary?: string;
    /** FERN_RUN_ID for cross-repo correlation (set by GitHub Action) */
    runId?: string;
}

export interface PipelineResult {
    success: boolean;
    steps: {
        replay?: ReplayStepResult;
        autoVersion?: AutoVersionStepResult;
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

export interface AutoVersionStepResult extends StepResult {
    /** The new version to use (e.g. "1.2.3"). Field name matches fiddle's Java AutoVersionResult DTO. */
    version?: string;
    /** Commit subject for the `[fern-autoversion]` commit. */
    commitMessage?: string;
    /** User-facing changelog entry appended to changelog.md. */
    changelogEntry?: string;
    /** Prior SDK version before this change (e.g. "1.2.2"). */
    previousVersion?: string;
    /** The version bump level determined by FAI. */
    versionBump?: "MAJOR" | "MINOR" | "PATCH" | "NO_CHANGE";
    /** Structured PR description with Before/After code fences for breaking changes. */
    prDescription?: string;
    /** One-sentence justification for WHY the version bump was chosen. */
    versionBumpReason?: string;
    /** SHA of the `[fern-autoversion]` commit once it's been made. TS-only; no fiddle counterpart. */
    commitSha?: string;
}

export interface GithubStepResult extends StepResult {
    commitSha?: string;
    branchUrl?: string;
    prUrl?: string;
    prNumber?: number;
    updatedExistingPr?: boolean;
    generationBaseTagSha?: string;
    /** True when generation produced no changes vs base branch — PR skipped */
    skippedNoDiff?: boolean;
    /** True when automerge was enabled on the PR */
    autoMergeEnabled?: boolean;
}

export interface StepResult {
    executed: boolean;
    success: boolean;
    errorMessage?: string;
}
