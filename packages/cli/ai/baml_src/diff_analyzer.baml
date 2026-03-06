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
function AnalyzeSdkDiff(
    diff: string @description("The git diff to analyze"),
    language: string @description("The SDK programming language, e.g. 'typescript', 'python', 'java'"),
    previous_version: string @description("The current published version before this change, e.g. '1.2.3'")
) -> AnalyzeCommitDiffResponse {
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

    --- Examples ---

    Examples of correct classifications:

    --- MAJOR: removed exported TypeScript function ---
    diff --git a/src/api/client.ts b/src/api/client.ts
    -export async function getUser(id: string): Promise<User> {
    -    return this.request("GET", `/users/${id}`);
    -}
    version_bump: MAJOR
    reason: Existing callers of getUser() will get a compile error.

    --- MAJOR: removed Python public method ---
    diff --git a/vital/client.py b/vital/client.py
    -    def get_user(self, user_id: str) -> User:
    -        return self._request("GET", f"/users/{user_id}")
    version_bump: MAJOR
    reason: Existing callers crash with AttributeError.

    --- MINOR: new optional TypeScript parameter ---
    diff --git a/src/api/client.ts b/src/api/client.ts
    -async createUser(name: string): Promise<User>
    +async createUser(name: string, role?: UserRole): Promise<User>
    version_bump: MINOR
    reason: Existing callers unaffected — new parameter is optional.

    --- MINOR: new Java public method ---
    diff --git a/src/.../UsersClient.java b/src/.../UsersClient.java
    +    public CompletableFuture<User> getUserAsync(String userId) {
    +        return this.httpClient.sendAsync(...);
    +    }
    version_bump: MINOR
    reason: New capability added, nothing removed or changed.

    --- PATCH: internal retry constant ---
    diff --git a/src/core/http_client.py b/src/core/http_client.py
    -MAX_RETRIES = 3
    +MAX_RETRIES = 5
    version_bump: PATCH
    reason: Implementation detail — public API surface unchanged.

    --- PATCH: Go import reorganization ---
    diff --git a/client.go b/client.go
    -import "fmt"
    -import "net/http"
    +import (
    +    "fmt"
    +    "net/http"
    +)
    version_bump: PATCH
    reason: Formatting change only, no functional difference.

    --- End Examples ---

    Apply these patterns to the diff below. When in doubt between MINOR and PATCH,
    prefer MINOR. When in doubt between MAJOR and MINOR, examine whether existing
    callers would break without any code changes on their side.

    Message Format (use this exact structure):
    ```
    <type>: <short summary>

    <detailed description of what changed and why it matters>

    Key changes:
    - <change 1>
    - <change 2>
    - <change 3>
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
    - Do not use "Fern regeneration" in commit messages - use "SDK regeneration" instead
    - NEVER include the literal version "505.503.4455" in the commit message - if you see this placeholder
    in the diff, describe changes generically (e.g., "added X-Fern-SDK-Version header")
    - The previous version is provided for context only. Do not include it
    literally in the commit message summary line.

    Previous version: {{previous_version}}
    SDK language: {{language}}

    Git Diff:
    ---
    {{diff}}
    ---

    Remember again that YOU MUST return a structured JSON response with these two fields:
    - message: A git commit message formatted like the example previously provided
    - version_bump: One of: MAJOR, MINOR, PATCH, or NO_CHANGE
  "#
}
