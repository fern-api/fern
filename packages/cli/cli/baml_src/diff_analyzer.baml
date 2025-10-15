// SDK Diff Analyzer
// Analyzes git diffs of SDK code and produces semantic commit messages and version bumps

// Enum for version bump types following semantic versioning
enum VersionBump {
  MAJOR
  MINOR
  PATCH
  NO_CHANGE
}

// The result of analyzing an SDK diff
class DiffAnalysisResult {
  // Semantic commit message headline (e.g., "feat: Add new authentication methods")
  headline string @description("A concise headline following conventional commits format (type: description)")

  // Detailed description of the changes
  description string @description("A detailed markdown-formatted description of the changes, explaining what changed and why it matters")

  // The recommended version bump
  version_bump VersionBump @description("The semantic version bump recommendation: MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes")

  // List of breaking changes (if any)
  breaking_changes string[] @description("List of breaking changes that would require a MAJOR version bump")
}

// Main function that analyzes SDK diffs
function AnalyzeSdkDiff(git_diff: string) -> DiffAnalysisResult {
  client DefaultClient

  prompt #"
    You are an expert software engineer analyzing changes to an SDK (Software Development Kit).

    Analyze the provided git diff and return a structured response with these exact fields:
    - headline: A semantic commit message in conventional commits format (e.g., "feat: Add user authentication")
    - description: A detailed markdown-formatted description of what changed and why it matters
    - version_bump: One of: MAJOR, MINOR, PATCH, or NO_CHANGE
    - breaking_changes: An array of breaking changes (empty array if none)

    Version Bump Guidelines:
    - MAJOR: Breaking changes (removed/renamed functions, changed signatures, removed parameters)
    - MINOR: New features that are backward compatible (new functions, new optional parameters)
    - PATCH: Bug fixes, documentation, internal refactoring (no public API changes)
    - NO_CHANGE: Only metadata, comments, or whitespace changes (no functional changes)

    Commit Headline Guidelines:
    - Format: <type>: <description>
    - Types: feat, fix, docs, refactor, test, chore
    - Keep under 72 characters
    - Be specific and action-oriented

    Description Guidelines:
    - Use markdown formatting
    - Explain WHAT changed and WHY it matters to SDK users
    - For breaking changes: include migration instructions
    - For new features: highlight new capabilities
    - For NO_CHANGE: explain that only non-functional changes were made

    Git Diff:
    {{ git_diff }}

    Return your analysis in the required structured format.
  "#
}
