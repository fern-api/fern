// BAML Configuration for Semantic Version Analysis
// This defines the AI function, types, and clients for analyzing git diffs

// Version bump types - matches fiddle's VersionBump enum
enum VersionBump {
    MAJOR
    MINOR
    PATCH
    NO_CHANGE
}

// Request type for diff analysis
class AnalyzeCommitDiffRequest {
    diff string @description("Git diff content to analyze")
}

// Response type with version bump recommendation and commit message
class AnalyzeCommitDiffResponse {
    versionBump VersionBump @description("Recommended semantic version bump")
    message string @description("Concise commit message for the changes")
}

// Configuration for AI service settings
class AiServiceSettings {
    maxDiffSize int? @alias("max_diff_size") @description("Maximum diff size in bytes")
    timeout int? @description("Request timeout in milliseconds")
}

// OpenAI GPT-4 client configuration
client<llm> OpenAIClient {
    provider openai
    options {
        model gpt-4o
        api_key env.OPENAI_API_KEY
    }
}

// Anthropic Claude client configuration
client<llm> AnthropicClient {
    provider anthropic
    options {
        model claude-3-5-sonnet-20241022
        api_key env.ANTHROPIC_API_KEY
    }
}

// AWS Bedrock client configuration
client<llm> BedrockClient {
    provider aws-bedrock
    options {
        model anthropic.claude-3-5-sonnet-20241022-v2:0
        region us-east-1
        access_key_id env.AWS_ACCESS_KEY_ID
        secret_access_key env.AWS_SECRET_ACCESS_KEY
    }
}

// Main function for analyzing git diffs and determining semantic version bumps
function AnalyzeCommitDiff(request: AnalyzeCommitDiffRequest) -> AnalyzeCommitDiffResponse {
    client OpenAIClient // Default to OpenAI
    prompt #"
You are an expert at semantic versioning for software development. Analyze the provided git diff and determine the appropriate semantic version bump (MAJOR, MINOR, PATCH, or NO_CHANGE) along with a concise commit message.

## Semantic Versioning Guidelines:

**MAJOR** (breaking changes):
- Removed or renamed public APIs, functions, classes, or methods
- Changed function signatures (parameters, return types)
- Removed public fields or properties
- Changes that would break existing client code
- Removed endpoints or changed endpoint URLs
- Changed required request/response schemas in breaking ways

**MINOR** (new features, backward compatible):
- Added new public APIs, functions, classes, or methods
- Added new optional parameters or fields
- Added new endpoints
- New features that don't break existing functionality
- Added new optional request/response fields

**PATCH** (bug fixes, backward compatible):
- Fixed bugs without changing public interfaces
- Internal refactoring that doesn't affect public APIs
- Documentation updates
- Performance improvements without API changes
- Fixed typos in code comments (not user-facing strings)
- Test improvements

**NO_CHANGE**:
- Only formatting changes (whitespace, indentation)
- Comment-only changes that don't affect functionality
- Changes to build scripts or CI configuration
- Changes to internal development files

## Instructions:

1. Analyze the git diff carefully
2. Look for patterns indicating breaking changes, new features, or bug fixes
3. If multiple types of changes are present, choose the highest impact level
4. Generate a concise, professional commit message (imperative mood, under 50 chars)
5. The message should summarize the key change without version information

## Git Diff:
```
{{ request.diff }}
```

Respond with the version bump and commit message in the exact format requested.
"#
}

// OpenAI version of the function
function AnalyzeCommitDiffOpenAI(request: AnalyzeCommitDiffRequest) -> AnalyzeCommitDiffResponse {
    client OpenAIClient
    prompt #"
You are an expert at semantic versioning for software development. Analyze the provided git diff and determine the appropriate semantic version bump (MAJOR, MINOR, PATCH, or NO_CHANGE) along with a concise commit message.

## Semantic Versioning Guidelines:

**MAJOR** (breaking changes):
- Removed or renamed public APIs, functions, classes, or methods
- Changed function signatures (parameters, return types)
- Removed public fields or properties
- Changes that would break existing client code
- Removed endpoints or changed endpoint URLs
- Changed required request/response schemas in breaking ways

**MINOR** (new features, backward compatible):
- Added new public APIs, functions, classes, or methods
- Added new optional parameters or fields
- Added new endpoints
- New features that don't break existing functionality
- Added new optional request/response fields

**PATCH** (bug fixes, backward compatible):
- Fixed bugs without changing public interfaces
- Internal refactoring that doesn't affect public APIs
- Documentation updates
- Performance improvements without API changes
- Fixed typos in code comments (not user-facing strings)
- Test improvements

**NO_CHANGE**:
- Only formatting changes (whitespace, indentation)
- Comment-only changes that don't affect functionality
- Changes to build scripts or CI configuration
- Changes to internal development files

## Instructions:

1. Analyze the git diff carefully
2. Look for patterns indicating breaking changes, new features, or bug fixes
3. If multiple types of changes are present, choose the highest impact level
4. Generate a concise, professional commit message (imperative mood, under 50 chars)
5. The message should summarize the key change without version information

## Git Diff:
```
{{ request.diff }}
```

Respond with the version bump and commit message in the exact format requested.
"#
}

// Anthropic version of the function
function AnalyzeCommitDiffAnthropic(request: AnalyzeCommitDiffRequest) -> AnalyzeCommitDiffResponse {
    client AnthropicClient
    prompt #"
You are an expert at semantic versioning for software development. Analyze the provided git diff and determine the appropriate semantic version bump (MAJOR, MINOR, PATCH, or NO_CHANGE) along with a concise commit message.

## Semantic Versioning Guidelines:

**MAJOR** (breaking changes):
- Removed or renamed public APIs, functions, classes, or methods
- Changed function signatures (parameters, return types)
- Removed public fields or properties
- Changes that would break existing client code
- Removed endpoints or changed endpoint URLs
- Changed required request/response schemas in breaking ways

**MINOR** (new features, backward compatible):
- Added new public APIs, functions, classes, or methods
- Added new optional parameters or fields
- Added new endpoints
- New features that don't break existing functionality
- Added new optional request/response fields

**PATCH** (bug fixes, backward compatible):
- Fixed bugs without changing public interfaces
- Internal refactoring that doesn't affect public APIs
- Documentation updates
- Performance improvements without API changes
- Fixed typos in code comments (not user-facing strings)
- Test improvements

**NO_CHANGE**:
- Only formatting changes (whitespace, indentation)
- Comment-only changes that don't affect functionality
- Changes to build scripts or CI configuration
- Changes to internal development files

## Instructions:

1. Analyze the git diff carefully
2. Look for patterns indicating breaking changes, new features, or bug fixes
3. If multiple types of changes are present, choose the highest impact level
4. Generate a concise, professional commit message (imperative mood, under 50 chars)
5. The message should summarize the key change without version information

## Git Diff:
```
{{ request.diff }}
```

Respond with the version bump and commit message in the exact format requested.
"#
}

// AWS Bedrock version of the function
function AnalyzeCommitDiffBedrock(request: AnalyzeCommitDiffRequest) -> AnalyzeCommitDiffResponse {
    client BedrockClient
    prompt #"
You are an expert at semantic versioning for software development. Analyze the provided git diff and determine the appropriate semantic version bump (MAJOR, MINOR, PATCH, or NO_CHANGE) along with a concise commit message.

## Semantic Versioning Guidelines:

**MAJOR** (breaking changes):
- Removed or renamed public APIs, functions, classes, or methods
- Changed function signatures (parameters, return types)
- Removed public fields or properties
- Changes that would break existing client code
- Removed endpoints or changed endpoint URLs
- Changed required request/response schemas in breaking ways

**MINOR** (new features, backward compatible):
- Added new public APIs, functions, classes, or methods
- Added new optional parameters or fields
- Added new endpoints
- New features that don't break existing functionality
- Added new optional request/response fields

**PATCH** (bug fixes, backward compatible):
- Fixed bugs without changing public interfaces
- Internal refactoring that doesn't affect public APIs
- Documentation updates
- Performance improvements without API changes
- Fixed typos in code comments (not user-facing strings)
- Test improvements

**NO_CHANGE**:
- Only formatting changes (whitespace, indentation)
- Comment-only changes that don't affect functionality
- Changes to build scripts or CI configuration
- Changes to internal development files

## Instructions:

1. Analyze the git diff carefully
2. Look for patterns indicating breaking changes, new features, or bug fixes
3. If multiple types of changes are present, choose the highest impact level
4. Generate a concise, professional commit message (imperative mood, under 50 chars)
5. The message should summarize the key change without version information

## Git Diff:
```
{{ request.diff }}
```

Respond with the version bump and commit message in the exact format requested.
"#
}