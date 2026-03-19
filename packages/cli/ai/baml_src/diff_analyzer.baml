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
    message string
        @description("Developer-facing git commit message. Use conventional commit format. Reference specific code symbols (function names, class names). Keep summary under 72 chars.")

    changelog_entry string
        @description("User-facing release note for CHANGELOG.md and GitHub Releases. Describe the impact on SDK consumers, not implementation details. Include migration instructions for MAJOR. Use plain prose, not conventional commit format. Empty string for PATCH.")

    version_bump VersionBump
        @description("The recommended semantic version bump: MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes and other changes, NO_CHANGE for empty diffs")

    version_bump_reason string
        @description("One sentence explaining WHY this version bump was chosen. For MAJOR: name the specific breaking symbol(s). For MINOR: name the new capability. For PATCH: describe the fix. For NO_CHANGE: 'No functional changes detected.' Example: 'MAJOR because `parserCreateJob` InputStream overloads were removed from `RawLabReportClient`.'")
}

// Main function that analyzes SDK diffs
function AnalyzeSdkDiff(
    diff: string @description("The git diff to analyze"),
    language: string @description("The SDK programming language, e.g. 'typescript', 'python', 'java'"),
    previous_version: string @description("The current published version before this change, e.g. '1.2.3'"),
    prior_changelog: string @description("The last 3 changelog entries for this SDK, empty string if none. Use this to match the existing commit message style and understand the versioning pattern."),
    spec_commit_message: string @description("The commit message from the API spec repository that triggered this SDK generation. Use as a hint for the intent of the change, but verify against the actual diff. Empty string if unavailable.")
) -> AnalyzeCommitDiffResponse {
  client DefaultClient

  prompt #"
    You are an expert software engineer analyzing changes to generate semantic commit messages.

    Analyze the provided git diff and return a structured response with these fields:
    - message: A git commit message formatted like the example below
    - version_bump: One of: MAJOR, MINOR, PATCH, or NO_CHANGE

    Version Bump Guidelines:
    - MAJOR: Breaking changes (removed/renamed functions, changed signatures, removed parameters)
    - MINOR: New features that are backward compatible (new functions, new optional parameters).
      Also MINOR: behavioral changes invisible to the public API surface that still affect consumers:
      - Changed HTTP status code handling (e.g. 404 now throws instead of returning null)
      - Changed default parameter values (timeout, retry count, page size, base URL)
      - Changed serialization behavior (date formats, null handling, field ordering)
      - Changed error message text that consumers may depend on
      - Changed HTTP header names or values sent to the server
      - Changed retry or backoff behavior (different retry counts, delay strategies)
    - PATCH: Bug fixes, documentation, internal refactoring with no observable behavioral change
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

    --- MINOR: changed default retry count ---
    diff --git a/src/core/http_client.py b/src/core/http_client.py
    -MAX_RETRIES = 3
    +MAX_RETRIES = 5
    version_bump: MINOR
    reason: Changed default retry count — existing consumers will experience different retry behavior.

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

    {% if language == "typescript" %}
    Language-specific breaking change rules for TypeScript:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, function, or exported symbol is MAJOR
    - Making a response field optional is MAJOR (type changes from T to T | undefined, breaking existing property access without null checks)
    - Changing a method return type (e.g. Promise<T> to Promise<T | undefined>, or T to T | null) is MAJOR
    - New enum values are MAJOR if the SDK generates exhaustive switch/if-else chains (callers get compile errors on unhandled cases)
    - Changing a union type (adding/removing variants) is MAJOR if callers use exhaustive type narrowing or discriminated unions
    - Adding a new required property to a request/input type is MAJOR (existing callers won't compile)
    - Removing or renaming an exported type, interface, or type alias is MAJOR
    - Changing the type of an existing property (e.g. string to number, or string to string[]) is MAJOR
    - Changing a generic type parameter constraint (e.g. <T extends Foo> to <T extends Bar>) is MAJOR
    - Converting a synchronous method to async (or vice versa) is MAJOR (changes return type to Promise<T>)
    - Removing a default export or switching between default and named exports is MAJOR
    - Changing the structure of a discriminated union (e.g. changing the discriminant field name) is MAJOR
    - Removing or renaming environment/server URL constants is MAJOR
    - Changing the constructor signature of a client class (adding required params) is MAJOR
    - Narrowing a parameter type (e.g. string | number to string) is MAJOR (callers passing number break)

    MINOR (backward-compatible additions):
    - Adding a new optional parameter to a function is MINOR
    - Adding new exported types, interfaces, or classes is MINOR
    - Adding new methods to an existing client class is MINOR
    - Adding new optional properties to request types is MINOR
    - Adding new enum values when NOT used in exhaustive checks is MINOR
    - Adding new environment/server URL constants is MINOR
    - Widening a parameter type (e.g. string to string | number) is MINOR
    - Adding new re-exports from index files is MINOR
    - Adding new error types or exception classes is MINOR
    - Adding new RequestOptions fields (e.g. timeout, retries) is MINOR
    - Deprecating (but not removing) a public API is MINOR

    PATCH (no API surface change):
    - Changes to internal/private modules (core/, _internal/, utils/) are PATCH
    - Reordering imports, formatting, or comment changes are PATCH
    - Updating SDK version headers (X-Fern-SDK-Version, User-Agent) is PATCH
    - Refactoring HTTP client internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in package.json is PATCH
    - Adding or modifying JSDoc/TSDoc comments is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Changes to .npmignore, tsconfig.json, or build configuration are PATCH
    - Updating serialization/deserialization logic that preserves the same public types is PATCH

    {% elif language == "python" %}
    Language-specific breaking change rules for Python:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, or function is always MAJOR
    - Adding a new required parameter to a public method is MAJOR (callers get TypeError)
    - Renaming a parameter in a public method is MAJOR if callers use keyword arguments
    - Removing a parameter from a public method signature is MAJOR
    - Changing the type of a parameter from one concrete type to an incompatible one is MAJOR
    - Changing exception types raised by a method (callers catching specific exceptions break) is MAJOR
    - Removing or renaming a public module or subpackage is MAJOR (import statements break)
    - Moving a public class/function to a different module without re-exporting from the original is MAJOR
    - Changing a class from inheriting one base to another when callers use isinstance() checks is MAJOR
    - Removing a public class attribute or property is MAJOR

    MINOR (backward-compatible additions):
    - Making a response field optional is usually MINOR (Python uses None propagation; callers rarely type-check strictly)
    - New enum values are MINOR (unknown values are handled gracefully with string fallbacks)
    - Changing a return type from a concrete type to Optional is MINOR (duck typing absorbs this)
    - Adding new public methods, classes, or modules is MINOR
    - Adding new optional parameters (with defaults) is MINOR
    - Adding new optional fields to Pydantic models is MINOR
    - Adding new exception/error classes is MINOR
    - Adding new class attributes or properties is MINOR
    - Adding new type overloads (@overload decorator) is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields (e.g. timeout, max_retries) is MINOR
    - Deprecating (but not removing) a public API is MINOR
    - Widening a type annotation (e.g. str to Union[str, int]) is MINOR

    PATCH (no API surface change):
    - Changes to private methods (prefixed with _) are PATCH
    - Changes to type hints only (no runtime effect) are PATCH
    - Reformatting, docstring updates, or comment changes are PATCH
    - Updating SDK version headers (X-Fern-SDK-Version, User-Agent) are PATCH
    - Refactoring httpx/requests client internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in pyproject.toml/setup.py is PATCH
    - Updating serialization/deserialization logic that preserves the same public types is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Changes to __init__.py that don't alter public re-exports are PATCH
    - Changes to conftest.py, test files, or CI configuration are PATCH

    {% elif language == "java" %}
    Language-specific breaking change rules for Java:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, or interface is always MAJOR
    - Making a response field optional (e.g. T to Optional<T>) is MAJOR (callers must handle Optional unwrapping)
    - New enum values are MAJOR if the SDK generates exhaustive switch statements
    - Adding a new required parameter to a public method is MAJOR
    - Changing a method's return type is MAJOR (even if compatible at runtime, recompilation fails)
    - Removing or changing a public static final constant is MAJOR
    - Changing a class from concrete to abstract (or vice versa) is MAJOR
    - Changing the checked exceptions declared in a throws clause is MAJOR
    - Removing a public constructor or changing its parameter list is MAJOR
    - Removing an interface that a public class implements is MAJOR
    - Changing generic type parameters on a public class (e.g. Foo<T> to Foo<T, U>) is MAJOR
    - Moving a public class to a different package without re-exporting is MAJOR
    - Narrowing a parameter type (e.g. Object to String) is MAJOR
    - Making a non-final class final is MAJOR (breaks subclassing)
    - Changing the type of a builder method parameter is MAJOR

    MINOR (backward-compatible additions):
    - Adding new overloaded methods is MINOR
    - Adding new public classes or interfaces is MINOR
    - Adding new optional builder methods is MINOR
    - Adding new enum values when NOT used in exhaustive switch statements is MINOR
    - Adding new optional fields to request objects is MINOR
    - Adding new exception/error classes is MINOR
    - Adding new static utility methods is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields (e.g. timeout, retries) is MINOR
    - Widening a parameter type (e.g. String to Object) is MINOR
    - Adding default methods to interfaces (Java 8+) is MINOR
    - Deprecating (but not removing) public APIs with @Deprecated is MINOR

    PATCH (no API surface change):
    - Changes to package-private or private methods are PATCH
    - Changes to annotations (other than public API annotations), Javadoc, or formatting are PATCH
    - Updating SDK version headers (X-Fern-SDK-Version, User-Agent) is PATCH
    - Refactoring OkHttp/HttpClient internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in build.gradle/pom.xml is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Updating serialization/deserialization logic (Jackson/Gson config) that preserves public types is PATCH
    - Changes to test files, CI configuration, or build scripts are PATCH

    {% elif language == "go" %}
    Language-specific breaking change rules for Go:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming an exported function, method, or type is always MAJOR
    - Making a response field a pointer type (e.g. string to *string) is MAJOR (callers must dereference)
    - Changing a function signature (adding/removing parameters or return values) is MAJOR (Go has no overloading)
    - Removing or renaming an exported struct field is MAJOR
    - Changing the type of an exported struct field is MAJOR
    - Removing or renaming an exported constant or variable is MAJOR
    - Changing an interface by adding methods is MAJOR (all implementations must add the method)
    - Removing a method from an interface is MAJOR (callers using that method break)
    - Changing a function's return type(s) is MAJOR (Go is strict about return types)
    - Changing a variadic parameter to non-variadic (or vice versa) is MAJOR
    - Moving a type/function to a different package without aliasing in the original is MAJOR
    - Changing the receiver type of a method (value receiver to pointer receiver changes method set) is MAJOR
    - Changing an exported error variable's type or value is MAJOR (callers using errors.Is break)

    MINOR (backward-compatible additions):
    - Adding new exported functions, methods, or types is MINOR
    - New enum-like constants are MINOR (Go enums are not exhaustive by default)
    - Adding new fields to a struct is MINOR (existing code still compiles, zero-value initialization)
    - Making a response field optional (pointer) is usually MINOR if the field was already a struct field
    - Adding new optional function parameters via functional options pattern is MINOR
    - Adding new interface types is MINOR
    - Adding new error types/variables is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOption functions is MINOR
    - Widening a return type from a concrete type to an interface is MINOR (if interface is satisfied)
    - Adding new methods to a concrete type (does not break interface implementations) is MINOR

    PATCH (no API surface change):
    - Changes to unexported (lowercase) functions or types are PATCH
    - Changes to go.mod dependencies, import reordering, or formatting are PATCH
    - Updating SDK version headers (X-Fern-SDK-Version, User-Agent) is PATCH
    - Refactoring http.Client internals without changing observable defaults or behavior is PATCH
    - Updating serialization/deserialization logic (JSON tags, encoding) that preserves identical output is PATCH
    - Refactoring internal implementation without changing exported signatures is PATCH
    - Changes to *_test.go files, Makefile, or CI configuration are PATCH
    - Updating comments, godoc, or code formatting (gofmt) is PATCH

    {% elif language == "ruby" %}
    Language-specific breaking change rules for Ruby:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public method is MAJOR (callers get NoMethodError)
    - Adding a new required positional parameter is MAJOR
    - Removing a method parameter is MAJOR (callers passing that argument get ArgumentError)
    - Changing the order of positional parameters is MAJOR
    - Removing or renaming a public class or module is MAJOR (callers get NameError)
    - Changing a method from instance to class method (or vice versa) is MAJOR
    - Changing the return type in a breaking way (e.g. returning nil where an object was expected and callers chain methods) is MAJOR
    - Removing a public constant is MAJOR
    - Changing exception types raised by a method is MAJOR (callers rescuing specific exceptions break)

    MINOR (backward-compatible additions):
    - Making a response field optional is usually MINOR (Ruby uses nil propagation; callers rarely type-check)
    - New enum values are MINOR (unknown values are handled gracefully)
    - Adding new optional keyword parameters (with defaults) is MINOR
    - Adding new public methods or classes is MINOR
    - Adding new optional fields to response/request objects is MINOR
    - Adding new exception/error classes is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields (e.g. timeout, max_retries) is MINOR
    - Deprecating (but not removing) a public API is MINOR
    - Adding new modules or mixins is MINOR

    PATCH (no API surface change):
    - Changes to private methods are PATCH
    - Gemspec metadata, comment, or formatting changes are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring Faraday/Net::HTTP internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in Gemfile/gemspec is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Changes to test files, Rakefile, or CI configuration are PATCH

    {% elif language == "csharp" %}
    Language-specific breaking change rules for C#:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, property, or interface is always MAJOR
    - Making a response field nullable (e.g. T to T?) is MAJOR (callers must handle null checks)
    - New enum values are MAJOR if the SDK generates exhaustive switch expressions
    - Adding a new required parameter to a public method is MAJOR
    - Changing a method's return type is MAJOR
    - Removing or changing a public constant or static readonly field is MAJOR
    - Changing a class from non-sealed to sealed (or abstract to concrete) is MAJOR
    - Changing the base class of a public class is MAJOR
    - Removing an interface implementation from a public class is MAJOR
    - Changing generic type constraints on a public class or method is MAJOR
    - Moving a public type to a different namespace without type forwarding is MAJOR
    - Changing property from read-write to read-only (removing setter) is MAJOR
    - Changing async method to sync (Task<T> to T) or vice versa is MAJOR

    MINOR (backward-compatible additions):
    - Adding new public classes, interfaces, or methods is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Adding new overloaded methods is MINOR
    - Adding new enum values when NOT used in exhaustive switch expressions is MINOR
    - Adding new optional properties to request objects is MINOR
    - Adding new exception types is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields (e.g. Timeout, MaxRetries) is MINOR
    - Adding new extension methods is MINOR
    - Deprecating (but not removing) public APIs with [Obsolete] is MINOR

    PATCH (no API surface change):
    - Changes to internal or private members are PATCH
    - XML doc comments, formatting, or namespace reorganization are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring HttpClient internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in .csproj is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Updating serialization/deserialization (System.Text.Json/Newtonsoft) config that preserves public types is PATCH
    - Changes to test files, .sln, or CI configuration are PATCH

    {% elif language == "php" %}
    Language-specific breaking change rules for PHP:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public method or class is always MAJOR
    - Changing a method signature (adding required parameters) is MAJOR
    - Removing a method parameter is MAJOR
    - Changing the type declaration of a parameter to an incompatible type is MAJOR
    - Removing or renaming a public constant is MAJOR
    - Changing a class from non-final to final is MAJOR (breaks extension)
    - Removing an interface implementation from a public class is MAJOR
    - Changing the return type declaration to an incompatible type is MAJOR
    - Moving a class to a different namespace without aliasing is MAJOR
    - Changing exception types thrown by a method is MAJOR

    MINOR (backward-compatible additions):
    - Making a response field nullable is MINOR in most cases (PHP is dynamically typed)
    - Adding new optional parameters (with defaults) is MINOR
    - Adding new public classes or methods is MINOR
    - New enum cases are usually MINOR (PHP enums are not typically used in exhaustive matches)
    - Adding new optional fields to request/response objects is MINOR
    - Adding new exception classes is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new traits or interfaces is MINOR
    - Adding new RequestOptions fields is MINOR
    - Deprecating (but not removing) public APIs is MINOR

    PATCH (no API surface change):
    - Changes to private/protected methods are PATCH
    - PHPDoc, formatting, or composer.json metadata changes are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring Guzzle/cURL internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in composer.json is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Changes to test files, phpunit.xml, or CI configuration are PATCH

    {% elif language == "swift" %}
    Language-specific breaking change rules for Swift:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public method, property, or type is always MAJOR
    - Making a response field optional (T to T?) is MAJOR (callers must unwrap with if-let/guard)
    - New enum cases are MAJOR (Swift switch statements must be exhaustive unless using default)
    - Adding a new required parameter to a public method is MAJOR
    - Changing the type of a public property is MAJOR
    - Removing or changing a public protocol requirement is MAJOR
    - Removing protocol conformance from a public type is MAJOR
    - Changing a struct to a class (or vice versa) is MAJOR (value vs reference semantics)
    - Making a public initializer failable (init to init?) or vice versa is MAJOR
    - Changing the associated values of an enum case is MAJOR
    - Removing a public typealias is MAJOR
    - Changing access level from public to internal/private is MAJOR

    MINOR (backward-compatible additions):
    - Adding new public types, methods, or properties is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Adding new enum cases when callers use default in switch is MINOR
    - Adding new protocol extensions with default implementations is MINOR
    - Adding new optional fields to request/response structs is MINOR
    - Adding new error types is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields is MINOR
    - Adding new convenience initializers is MINOR
    - Deprecating (but not removing) public APIs with @available(*, deprecated) is MINOR

    PATCH (no API surface change):
    - Changes to internal or private members are PATCH
    - Formatting, comments, or documentation changes are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring URLSession internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in Package.swift is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Changes to test files, xcconfig, or CI configuration are PATCH

    {% elif language == "rust" %}
    Language-specific breaking change rules for Rust:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public function, struct, enum, or trait is always MAJOR
    - Making a response field optional (T to Option<T>) is MAJOR (callers must handle the Option)
    - New enum variants are MAJOR (Rust match statements must be exhaustive unless using _ wildcard)
    - Adding a new required field to a public struct is MAJOR (unless #[non_exhaustive])
    - Removing a public trait implementation is MAJOR
    - Changing a function's return type is MAJOR
    - Adding a required method to a public trait is MAJOR (all implementations must add it)
    - Changing the type of a public struct field is MAJOR
    - Removing or renaming a public module is MAJOR
    - Making a public type private (pub to pub(crate) or removing pub) is MAJOR
    - Changing a struct from non-exhaustive to exhaustive construction (removing .. Default::default()) is MAJOR
    - Changing generic type parameters or their bounds on public types is MAJOR
    - Changing from Result<T, E1> to Result<T, E2> where E2 is a different error type is MAJOR
    - Removing a public constant or static is MAJOR

    MINOR (backward-compatible additions):
    - Adding new public functions, structs, or enums is MINOR
    - Adding new optional fields to #[non_exhaustive] structs is MINOR
    - Adding new enum variants to #[non_exhaustive] enums is MINOR
    - Adding new trait implementations for existing types is MINOR
    - Adding new public constants or statics is MINOR
    - Adding new methods to existing impl blocks is MINOR
    - Adding new error types is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields is MINOR
    - Adding new optional builder methods is MINOR
    - Deprecating (but not removing) public APIs with #[deprecated] is MINOR

    PATCH (no API surface change):
    - Changes to pub(crate) or private items are PATCH
    - Cargo.toml metadata, formatting, or comment changes are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring reqwest/hyper internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in Cargo.toml is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Updating serialization/deserialization (serde) config that preserves public types is PATCH
    - Changes to test files, build.rs, or CI configuration are PATCH

    {% elif language == "kotlin" %}
    Language-specific breaking change rules for Kotlin:

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public function, class, or property is always MAJOR
    - Making a response field nullable (T to T?) is MAJOR (callers must handle null safety operators)
    - New enum values are MAJOR if used in when() expressions without else branch
    - Adding a new required parameter to a public function is MAJOR
    - Changing a method's return type is MAJOR
    - Removing or changing a public constant (const val / companion object val) is MAJOR
    - Changing a class from open to final (or data class to regular class) is MAJOR
    - Removing an interface implementation from a public class is MAJOR
    - Changing generic type parameters or their variance (in/out) on public types is MAJOR
    - Moving a public class to a different package without type aliasing is MAJOR
    - Changing a property from var to val (or removing a setter) is MAJOR
    - Changing a suspend function to non-suspend (or vice versa) is MAJOR
    - Changing sealed class/interface hierarchy (removing subclasses) is MAJOR

    MINOR (backward-compatible additions):
    - Adding new public classes, functions, or extension functions is MINOR
    - Adding new optional parameters (with default values) is MINOR
    - Adding new enum values when callers use else in when() is MINOR
    - Adding new optional properties to data classes is MINOR
    - Adding new exception types is MINOR
    - Adding new environment/server URL constants is MINOR
    - Adding new RequestOptions fields is MINOR
    - Adding new sealed class/interface subtypes is MINOR (if callers have else branch)
    - Deprecating (but not removing) public APIs with @Deprecated is MINOR
    - Adding new companion object functions is MINOR

    PATCH (no API surface change):
    - Changes to internal or private members are PATCH
    - KDoc, formatting, or build.gradle changes are PATCH
    - Updating SDK version headers is PATCH
    - Refactoring OkHttp internals without changing observable defaults or behavior is PATCH
    - Updating dependency versions in build.gradle.kts is PATCH
    - Refactoring internal implementation without changing public signatures is PATCH
    - Updating serialization/deserialization (kotlinx.serialization/Moshi) config that preserves public types is PATCH
    - Changes to test files or CI configuration are PATCH

    {% else %}
    Language-specific breaking change rules (language: {{ language }}):

    MAJOR (breaking):
    - Removing a required response field is always MAJOR
    - Removing or renaming a public class, method, or function is always MAJOR
    - Making a response field optional is MAJOR in statically-typed languages (TypeScript, Java, C#, Swift, Rust, Kotlin, Go), usually MINOR in dynamically-typed ones (Python, Ruby, PHP)
    - New enum values are MAJOR if the language enforces exhaustive matching (TypeScript, Java, C#, Swift, Rust), MINOR otherwise
    - Adding a new required parameter to a public method is MAJOR
    - Changing a method's return type is MAJOR
    - Changing the type of an existing field/property is MAJOR
    - Removing or changing public constants is MAJOR

    MINOR (backward-compatible additions):
    - Adding new public APIs (classes, methods, functions) is MINOR
    - Adding new optional parameters is MINOR
    - Adding new optional fields to request/response objects is MINOR
    - Adding new error/exception types is MINOR
    - Deprecating (but not removing) public APIs is MINOR

    PATCH (no API surface change):
    - Internal/private changes are PATCH
    - Formatting, documentation, or comment changes are PATCH
    - Dependency version updates are PATCH
    - SDK version header updates are PATCH
    - Refactoring retry/timeout internals without changing observable defaults or behavior is PATCH
    - Refactoring internals without changing public signatures is PATCH
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

    {% if prior_changelog %}
    Prior changelog entries (for style reference):
    ---
    {{prior_changelog}}
    ---
    Match the tone and format of these entries in your commit message.
    {% endif %}

    {% if spec_commit_message %}
    The API spec change that triggered this SDK generation had the following commit message:
    "{{spec_commit_message}}"
    Use this as a hint for understanding the intent of the change, but always verify
    against the actual diff below. The commit message may be vague or inaccurate.
    {% endif %}

    Previous version: {{previous_version}}
    SDK language: {{language}}

    Git Diff:
    ---
    {{diff}}
    ---

    Changelog Entry Guidelines:
    - Write for SDK consumers, not engineers reading the source code
    - MAJOR: explain what broke and how to migrate ("The `getUser` method has been
      removed. Replace calls with `fetchUser(id)` which returns the same type.")
    - MINOR: describe the new capability ("New `createPayment()` method available
      on `PaymentsClient`.")
    - PATCH: leave empty string — patch changes don't warrant changelog entries
    - Do not use conventional commit prefixes (no "feat:", "fix:", etc.)
    - Write in third person ("The SDK now supports..." not "Add support for...")
    - IMPORTANT: Wrap any type references containing angle brackets in backticks
      to prevent MDX parsing issues. For example, write `Optional<String>` not
      Optional<String>, and `Map<String, Object>` not Map<String, Object>.

    Remember again that YOU MUST return a structured JSON response with these four fields:
    - message: A git commit message formatted like the example previously provided
    - changelog_entry: A user-facing release note (empty string for PATCH)
    - version_bump: One of: MAJOR, MINOR, PATCH, or NO_CHANGE
    - version_bump_reason: One sentence explaining WHY this bump level was chosen.
      For MAJOR, name the specific breaking symbol(s) and explain why existing callers break.
      For MINOR, name the new capability added.
      For PATCH, describe what was fixed or improved.
      For NO_CHANGE, say "No functional changes detected."
      Example: "MAJOR because `parserCreateJob` InputStream overloads were removed from `RawLabReportClient`, breaking existing callers."
  "#
}

class ConsolidateChangelogResponse {
    consolidated_changelog string
        @description("CHANGELOG.md entry in Keep a Changelog format. Group under ### Breaking Changes, ### Added, ### Changed, ### Fixed. Bold symbol names, one tight sentence per bullet. Prose only, no code fences. Append migration action inline for breaking changes.")

    pr_description string
        @description("PR description with ## Breaking Changes section (if any) containing ### per breaking change with Before/After code fences and Migration line, then ## What's New section summarizing features in prose paragraphs grouped by theme. Do NOT list every class individually — summarize repetitive changes as a single entry.")

    version_bump_reason string
        @description("One sentence explaining WHY the overall version bump was chosen. For MAJOR: name the specific breaking symbol(s). For MINOR: name the new capability. For PATCH: describe the fix. Example: 'MAJOR because `parserCreateJob` InputStream overloads were removed from `RawLabReportClient`.'")
}

function ConsolidateChangelog(
    raw_entries: string @description("Newline-separated raw changelog entries from chunked diff analysis"),
    version_bump: string @description("The overall version bump: MAJOR, MINOR, or PATCH"),
    language: string @description("The SDK programming language, e.g. 'typescript', 'python', 'java'")
) -> ConsolidateChangelogResponse {
  client DefaultClient

  prompt #"
    You are a technical writer formatting release notes for a {{language}} SDK.

    The raw change notes below are noisy and repetitive — many bullets describe the same
    change across different packages. Deduplicate aggressively: if the same feature appears
    multiple times, merge into one entry.

    Raw changelog entries:
    ---
    {{raw_entries}}
    ---

    Overall version bump: {{version_bump}}

    Produce three outputs:

    ---

    ## 1. CHANGELOG.md entry (Keep a Changelog format)

    - Group under: `### Breaking Changes`, `### Added`, `### Changed`, `### Fixed`
    - Only include sections with entries
    - **Bold the symbol name** first, then one tight sentence for SDK consumers
    - No code fences — prose only
    - For breaking changes, append the migration action inline

    ## 2. PR Description

    - `## Breaking Changes` section at top (if any)
      - One `###` per breaking change with **Before/After** code fences and a **Migration:** line
    - `## What's New` section summarizing added/changed features in prose paragraphs,
      grouped by theme (e.g. logging, streaming, pagination, builder improvements)
    - Do NOT list every class that got the same method — summarize as a single entry

    ## 3. Version Bump Reason

    - One sentence explaining WHY the overall version bump ({{version_bump}}) was chosen
    - For MAJOR: name the specific breaking symbol(s) and explain why existing callers break
    - For MINOR: name the new capability added
    - For PATCH: describe what was fixed or improved
    - Example: "MAJOR because `parserCreateJob` InputStream overloads were removed from `RawLabReportClient`, breaking existing callers."

    ---

    {{ ctx.output_format }}
  "#
}
