/**
 * Standalone type definitions for the CLI AI package.
 *
 * These mirror the BAML-generated types in ./baml_client/types.ts but have no
 * runtime dependency on @boundaryml/baml, so they can be imported without
 * requiring the (optional) BAML package to be installed.
 */

export enum VersionBump {
    MAJOR = "MAJOR",
    MINOR = "MINOR",
    PATCH = "PATCH",
    NO_CHANGE = "NO_CHANGE"
}

export interface AnalyzeCommitDiffResponse {
    message: string;
    changelog_entry: string;
    version_bump: VersionBump;
    version_bump_reason: string;
}

export interface ConsolidateChangelogResponse {
    consolidated_changelog: string;
    pr_description: string;
    version_bump_reason: string;
}
