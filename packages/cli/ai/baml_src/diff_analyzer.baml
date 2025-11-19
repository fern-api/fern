// SDK Diff Analyzer
// Analyzes git diffs of SDK code and produces semantic commit messages and version bumps

enum VersionBump {
    MAJOR
    MINOR
    PATCH
    NO_CHANGE
}

class AnalyzeCommitDiffRequest {
    diff string @description("The git diff to analyze for generating a commit message")
}

class AnalyzeCommitDiffResponse {
    message string @description("The AI-generated commit message summarizing the changes in the diff")

    version_bump VersionBump @description("The recommended semantic version bump: MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes and other changes, NO_CHANGE for empty diffs")
}

// Main function that analyzes SDK diffs
function AnalyzeSdkDiff(diff: string @description("The git diff to analyze for generating a commit message")) -> AnalyzeCommitDiffResponse {
  client DefaultClient

  prompt #"
    You are an expert software engineer analyzing changes to generate semantic commit messages.

    Analyze the provided git diff and return a structured response with these fields:
    - message: A git commit message formatted like the example below
    - version_bump: One of: MAJOR, MINOR, PATCH, or NO_CHANGE

    Version Bump Guidelines:
    - MAJOR: Breaking changes (removed/renamed functions, changed signatures, removed parameters)
    - MINOR: New features that are backward compatible (new functions, new optional parameters)
    - PATCH: Bug fixes, documentation, internal refactoring, or other changes that don't affect the public API
    - NO_CHANGE: The diff is empty

    Message Format (use this exact structure):
    ```
    <type>: <short summary>

    <detailed description of what changed and why it matters>

    Key changes:
    - <change 1>
    - <change 2>
    - <change 3>

    🌿 Generated with Fern
    ```

    Message Guidelines:
    - Use conventional commit types: feat, fix, refactor, docs, chore, test, style, perf
    - Keep the summary line under 72 characters
    - Write in present tense imperative mood ("add" not "added" or "adds")
    - For breaking changes: include migration instructions in the detailed description
    - For new features: highlight new capabilities in the key changes
    - For PATCH: describe the fix or improvement
    - For NO_CHANGE: use type "chore" and state that no functional changes were made
    - Be specific and action-oriented
    - Always end with the "🌿 Generated with Fern" footer
    - NEVER include the literal version "505.503.4455" in the commit message - if you see this placeholder
    in the diff, describe changes generically (e.g., "added X-Fern-SDK-Version header")

    Git Diff:
    ---
    {{diff}}
    ---
  "#
}
