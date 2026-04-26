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
        generationCommit?: GenerationCommitStepResult;
        replay?: ReplayStepResult;
        autoVersion?: AutoVersionStepResult;
        fernignore?: FernignoreStepResult;
    };
}

export interface GenerationCommitStepConfig {
    enabled: boolean;
    /** Passed to replayPrepare — commits generation, skips detect/apply in phase 2. */
    skipApplication?: boolean;
}

/**
 * Result of running replayPrepare(). Holds the opaque PreparedReplay handle that
 * downstream steps (AutoVersionStep, ReplayStep) consume.
 *
 * `preparedReplay` is null when replay isn't initialized for this repo (no
 * lockfile) or when prepare failed — the pipeline proceeds without replay in
 * both cases.
 */
export interface GenerationCommitStepResult extends StepResult {
    /** Opaque handle consumed by ReplayStep's apply phase. Imported at the import site to avoid circular deps. */
    preparedReplay?: import("../replay/replay-run").PreparedReplay | null;
    previousGenerationSha?: string;
    currentGenerationSha?: string;
    baseBranchHead?: string;
    /** Flow selected by the replay service during prepare. */
    flow?: "first-generation" | "no-patches" | "normal-regeneration" | "skip-application";
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
    /** Fallback version when no prior generation exists (first run). Defaults to "0.0.1" (or "v0.0.1" for Go). */
    baseVersion?: string;
    /**
     * BAML AI service configuration (provider + model). Required when `enabled: true` — without it,
     * AnalyzeSdkDiff calls will fail and the step will fall back to a PATCH bump.
     * Shape matches `generatorsYml.AiServicesSchema` from @fern-api/configuration; typed structurally
     * to avoid pulling the configuration package into generator-cli's dep graph.
     */
    ai?: AutoVersionAiConfig;
    /** Optional Fern API token passed through to BAML client configuration if needed by the provider. */
    fernToken?: string;
    /** Spec repository commit message included as additional AI context. */
    specCommitMessage?: string;
    /** When true, strips "🌿 Generated with Fern" trailers from commit messages (whitelabel customers). */
    isWhitelabel?: boolean;
}

/**
 * Minimal shape for the BAML AI service configuration. Structural equivalent of
 * `generatorsYml.AiServicesSchema` from @fern-api/configuration.
 */
export interface AutoVersionAiConfig {
    provider: string;
    model: string;
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
    /** When true: separate PRs per generation, automerge support, run_id in body */
    automationMode?: boolean;
    /** When true: skip opening a PR / pushing when the generated output has no diff from the base branch. */
    skipIfNoDiff?: boolean;
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
        generationCommit?: GenerationCommitStepResult;
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
