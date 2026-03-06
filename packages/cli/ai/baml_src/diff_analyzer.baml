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

    Language-specific breaking change rules for {{ language }}:
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, or function is always MAJOR
    {% if language == "typescript" %}
    - Making a response field optional is MAJOR (type changes from T to T | undefined, breaking existing property access)
    - New enum values are MAJOR if the SDK generates exhaustive switch/if-else chains (callers get compile errors)
    - Changing a union type (e.g. adding/removing variants) is MAJOR if callers use exhaustive checks
    - Changing a method return type (e.g. Promise<T> to Promise<T | undefined>) is MAJOR
    - Adding a new required property to a request type is MAJOR (existing callers won't compile)
    - Adding a new optional parameter to a function is MINOR
    - Adding new exported types, interfaces, or classes is MINOR
    - Adding new methods to an existing client class is MINOR
    - Changes to internal/private modules (core/, _internal/) are PATCH
    - Reordering imports, formatting, or comment changes are PATCH
    {% elif language == "python" %}
    - Making a response field optional is usually MINOR (Python uses None propagation; callers rarely type-check strictly)
    - New enum values are MINOR (unknown values are handled gracefully with string fallbacks)
    - Adding a new required parameter to a public method is MAJOR (callers get TypeError)
    - Changing a return type from a concrete type to Optional is MINOR (duck typing absorbs this)
    - Adding new public methods, classes, or modules is MINOR
    - Adding new optional parameters (with defaults) is MINOR
    - Renaming a parameter in a public method is MAJOR if callers use keyword arguments
    - Changes to private methods (prefixed with _) are PATCH
    - Changes to type hints only (no runtime effect) are PATCH
    - Reformatting, docstring updates, or comment changes are PATCH
    {% elif language == "java" %}
    - Making a response field optional (e.g. T to Optional<T>) is MAJOR (callers must handle Optional unwrapping)
    - New enum values are MAJOR if the SDK generates exhaustive switch statements
    - Adding a new required parameter to a public method is MAJOR
    - Changing a method's return type is MAJOR (even if compatible at runtime, recompilation fails)
    - Adding new overloaded methods is MINOR
    - Adding new public classes or interfaces is MINOR
    - Adding new optional builder methods is MINOR
    - Changes to package-private or private methods are PATCH
    - Changes to annotations, Javadoc, or formatting are PATCH
    {% elif language == "go" %}
    - Making a response field a pointer type (e.g. string to *string) is MAJOR (callers must dereference)
    - Removing or renaming an exported function, method, or type is MAJOR
    - Changing a function signature (adding/removing parameters) is MAJOR (Go has no overloading)
    - Adding new exported functions, methods, or types is MINOR
    - New enum-like constants are MINOR (Go enums are not exhaustive by default)
    - Making a response field optional (pointer) is usually MINOR if the field was already a struct field
    - Adding new fields to a struct is MINOR (existing code still compiles)
    - Changes to unexported (lowercase) functions or types are PATCH
    - Changes to go.mod dependencies, import reordering, or formatting are PATCH
    {% elif language == "ruby" %}
    - Making a response field optional is usually MINOR (Ruby uses nil propagation; callers rarely type-check)
    - New enum values are MINOR (unknown values are handled gracefully)
    - Removing or renaming a public method is MAJOR (callers get NoMethodError)
    - Adding a new required positional parameter is MAJOR
    - Adding new optional keyword parameters (with defaults) is MINOR
    - Adding new public methods or classes is MINOR
    - Changes to private methods are PATCH
    - Gemspec metadata, comment, or formatting changes are PATCH
    {% elif language == "csharp" %}
    - Making a response field nullable (e.g. T to T?) is MAJOR (callers must handle null checks)
    - New enum values are MAJOR if the SDK generates exhaustive switch expressions
    - Adding a new required parameter to a public method is MAJOR
    - Changing a method's return type is MAJOR
    - Adding new public classes, interfaces, or methods is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Adding new overloaded methods is MINOR
    - Changes to internal or private members are PATCH
    - XML doc comments, formatting, or namespace reorganization are PATCH
    {% elif language == "php" %}
    - Making a response field nullable is MINOR in most cases (PHP is dynamically typed)
    - Removing or renaming a public method is MAJOR
    - Changing a method signature (adding required parameters) is MAJOR
    - Adding new optional parameters (with defaults) is MINOR
    - Adding new public classes or methods is MINOR
    - New enum cases are usually MINOR (PHP enums are not typically used in exhaustive matches)
    - Changes to private/protected methods are PATCH
    - PHPDoc, formatting, or composer.json metadata changes are PATCH
    {% elif language == "swift" %}
    - Making a response field optional (T to T?) is MAJOR (callers must unwrap with if-let/guard)
    - New enum cases are MAJOR (Swift switch statements must be exhaustive unless using default)
    - Removing or renaming a public method, property, or type is MAJOR
    - Adding a new required parameter to a public method is MAJOR
    - Adding new public types, methods, or properties is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Changes to internal or private members are PATCH
    - Formatting, comments, or documentation changes are PATCH
    {% elif language == "rust" %}
    - Making a response field optional (T to Option<T>) is MAJOR (callers must handle the Option)
    - New enum variants are MAJOR (Rust match statements must be exhaustive unless using _ wildcard)
    - Removing or renaming a public function, struct, or enum is MAJOR
    - Adding a new required field to a public struct is MAJOR (unless #[non_exhaustive])
    - Adding new public functions, structs, or enums is MINOR
    - Adding new optional fields to #[non_exhaustive] structs is MINOR
    - Changes to pub(crate) or private items are PATCH
    - Cargo.toml metadata, formatting, or comment changes are PATCH
    {% elif language == "kotlin" %}
    - Making a response field nullable (T to T?) is MAJOR (callers must handle null safety)
    - New enum values are MAJOR if used in when() expressions without else branch
    - Removing or renaming a public function, class, or property is MAJOR
    - Adding a new required parameter to a public function is MAJOR
    - Adding new public classes, functions, or extension functions is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Changes to internal or private members are PATCH
    - KDoc, formatting, or build.gradle changes are PATCH
    {% else %}
    - Making a response field optional is MAJOR in statically-typed languages, usually MINOR in dynamically-typed ones
    - New enum values are MAJOR if the language enforces exhaustive matching, MINOR otherwise
    - Adding new public APIs is MINOR
    - Internal/private changes are PATCH
    {% endif %}

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
