// SDK Diff Analyzer
// Analyzes git diffs of SDK code and produces semantic commit messages and version bumps

// Enum for version bump types following semantic versioning
enum VersionBump {
  MAJOR
  MINOR
  PATCH
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
    Your task is to analyze the git diff provided and produce:
    1. A semantic commit message with a conventional commits headline
    2. A detailed description of the changes
    3. A version bump recommendation (MAJOR, MINOR, or PATCH)

    Guidelines for version bumps:
    - MAJOR: Breaking changes that affect existing API contracts (removed functions, changed signatures, removed parameters)
    - MINOR: New features or additions that are backward compatible (new functions, new parameters with defaults)
    - PATCH: Bug fixes, documentation updates, internal refactoring that doesn't change the public API

    Guidelines for commit message headlines:
    - Use conventional commits format: <type>: <description>
    - Types: feat (new feature), fix (bug fix), docs (documentation), refactor (code refactoring), test (tests)
    - Keep it under 72 characters
    - Be specific and descriptive

    Guidelines for descriptions:
    - Use markdown formatting
    - Explain what changed and why it matters to SDK users
    - Include migration notes for breaking changes
    - Highlight new capabilities for features

    Git Diff to Analyze:
    ---
    {{ git_diff }}
    ---

    Analyze this diff and provide your assessment.
  "#
}
