export const FERN_REPO_PACKAGE_NAME = "fern";

export const FERN_TEST_REPO_NAME = "fern-api/empty";

export const FERN_CONFIG_JSON_FILENAME = "fern.config.json";

export const FERN_CONFIG_JSON_CONTENT = {
    organization: "fern",
    version: "*"
};

export const REMOTE_GROUP_NAME = "remote";
export const LOCAL_GROUP_NAME = "local";

// Source of truth: const arrays (enables runtime iteration)
export const ALL_GENERATOR_NICKNAMES = ["ts-sdk", "java-sdk", "go-sdk", "python-sdk"] as const;
export const ALL_TEST_FIXTURES = ["imdb"] as const;
export const ALL_OUTPUT_MODES = ["github", "local"] as const;
export const ALL_GENERATION_MODES = ["local", "remote"] as const;

// Derived types (enables type safety in switch statements)
export type GeneratorNickname = (typeof ALL_GENERATOR_NICKNAMES)[number];
export type TestFixture = (typeof ALL_TEST_FIXTURES)[number];
export type OutputMode = (typeof ALL_OUTPUT_MODES)[number];
export type GenerationMode = (typeof ALL_GENERATION_MODES)[number];

export type GeneratorName =
    | "fernapi/fern-typescript-sdk"
    | "fernapi/fern-java-sdk"
    | "fernapi/fern-go-sdk"
    | "fernapi/fern-python-sdk";

export const GeneratorNameFromNickname: Record<GeneratorNickname, GeneratorName> = {
    "ts-sdk": "fernapi/fern-typescript-sdk",
    "java-sdk": "fernapi/fern-java-sdk",
    "go-sdk": "fernapi/fern-go-sdk",
    "python-sdk": "fernapi/fern-python-sdk"
};

// ============================================================================
// File System Paths
// ============================================================================
export const FERN_DIRECTORY_NAME = "fern";
export const DEFINITION_DIRECTORY_NAME = "definition";
export const GENERATORS_YML_FILENAME = "generators.yml";
export const SDKS_DIRECTORY_NAME = "sdks";
export const TEST_DEFINITIONS_RELATIVE_PATH = "test-definitions";
export const APIS_DIRECTORY_NAME = "apis";
export const SEED_REMOTE_LOCAL_OUTPUT_DIR = "seed-remote-local";

// Fern CLI paths (relative to fern repo root)
export const CLI_RELATIVE_PATH = "packages/cli/cli/dist/prod/cli.cjs";

// Directory name patterns
export const OUTPUT_MODE_SUFFIX = "OutputMode";
export const GENERATION_MODE_SUFFIX = "Generation";

// ============================================================================
// CLI Commands & Flags
// ============================================================================
export const FERN_GENERATE_COMMAND = "generate";
export const FLAG_GROUP = "--group";
export const FLAG_LOG_LEVEL = "--log-level";
export const FLAG_LOCAL = "--local";

// ============================================================================
// Git Commands & Flags
// ============================================================================
export const GIT_CLONE_COMMAND = "clone";
export const GIT_BRANCH_FLAG = "--branch";
export const GIT_DEPTH_FLAG = "--depth";
export const GIT_DEPTH_VALUE = "1";

// ============================================================================
// Diff Command & Flags
// ============================================================================
export const DIFF_COMMAND = "diff";
export const DIFF_RECURSIVE_FLAG = "-r";

// ============================================================================
// GitHub CLI Commands
// ============================================================================
export const GH_COMMAND = "gh";
export const GH_API_SUBCOMMAND = "api";
export const GH_JQ_FLAG = "--jq";
export const GH_BRANCHES_JQ_QUERY = ".[0].name";

// ============================================================================
// Package Locations
// ============================================================================
export const PACKAGE_LOCATION_NPM = "npm";
export const PACKAGE_LOCATION_MAVEN = "maven";
export const PACKAGE_LOCATION_PYPI = "pypi";
export const PACKAGE_LOCATION_LOCAL_FILE_SYSTEM = "local-file-system";

// ============================================================================
// Package Names (per generator)
// ============================================================================
export const TS_SDK_PACKAGE_NAME = "@fern-fern/test-remote-local-sdk";
export const JAVA_SDK_MAVEN_COORDINATE = "com.fern-api:test-remote-local-sdk";
export const PYTHON_SDK_PACKAGE_NAME = "test-remote-local-sdk";
export const GO_SDK_MODULE_PATH = "github.com/fern-api/test-remote-local-sdk";

// ============================================================================
// GitHub Configuration
// ============================================================================
export const GITHUB_OUTPUT_MODE_PULL_REQUEST = "pull-request";
export const GITHUB_TOKEN_ENV_VAR_REFERENCE = "${GITHUB_TOKEN}";

// ============================================================================
// URLs and External Services
// ============================================================================

// Docker Hub
export const DOCKER_HUB_API_BASE_URL = "https://hub.docker.com/v2";
export const DOCKER_HUB_TAGS_PAGE_SIZE = 100;
export const DOCKER_HUB_TAGS_ORDERING = "-last_updated";

// GitHub
export const GITHUB_BASE_URL = "https://github.com";

// ============================================================================
// Environment Variables
// ============================================================================
export const ENV_VAR_GITHUB_TOKEN = "GITHUB_TOKEN";
export const ENV_VAR_FERN_TOKEN = "FERN_TOKEN";

// ============================================================================
// YAML Schema
// ============================================================================
export const GENERATORS_YML_SCHEMA_URL = "https://schema.buildwithfern.dev/generators-yml.json";
export const GENERATORS_YML_SCHEMA_COMMENT = "# yaml-language-server: $schema=";

// ============================================================================
// Version Constants
// ============================================================================
export const LOCAL_BUILD_VERSION = "99.99.99";

// ============================================================================
// Regex Patterns
// ============================================================================

// Semantic versioning pattern: X.Y.Z
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

// GitHub branch URL pattern in logs
export const GITHUB_BRANCH_URL_REGEX = /Pushed branch: https:\/\/github\.com\/[^\/]+\/[^\/]+\/tree\/([^\s]+)/;

// ============================================================================
// Log Messages & Separators
// ============================================================================

// Log separators
export const LOG_SEPARATOR = "=".repeat(80);
export const LOG_SECTION_SEPARATOR = "━━━";

// Section headers
export const LOG_HEADER_LOCAL_GENERATION = "LOCAL GENERATION (Docker)";
export const LOG_HEADER_REMOTE_GENERATION = "REMOTE GENERATION (Fiddle)";
export const LOG_HEADER_COMPARING_OUTPUTS = "COMPARING OUTPUTS";
export const LOG_HEADER_TEST_SUMMARY = "TEST SUMMARY";

// Success/failure messages
export const MSG_ALL_TESTS_PASSED = "✓ All tests passed!";
export const MSG_BOTH_GENERATIONS_SUCCESSFUL = "✓ Both generations completed successfully";
export const MSG_OUTPUTS_MATCH = "✓ Outputs match perfectly";
export const MSG_OUTPUTS_DIFFER = "⚠ Outputs differ";
export const MSG_TEST_PASSED_PREFIX = "✓ Test passed: ";
export const MSG_TEST_FAILED_PREFIX = "✗ Test failed: ";
export const MSG_GENERATION_RUNNING_PREFIX = "▶ Running";
export const MSG_GENERATION_COMPLETED_PREFIX = "✓";
export const MSG_GENERATION_FAILED_PREFIX = "✗";

// Error messages
export const ERROR_NO_GENERATOR_VERSION = "No version found for generator";
export const ERROR_OUTPUTS_DIFFER = "Local and remote outputs differ. See logs for details.";
export const ERROR_DIFF_COMMAND_FAILED = "Diff command failed";
export const ERROR_FAILED_TO_CLONE = "Failed to clone repository";
export const ERROR_FAILED_TO_GET_BRANCH = "Failed to get most recent branch";
export const ERROR_INVALID_GENERATOR_NAME = "Invalid generator name format";
export const ERROR_DOCKER_HUB_API_FAILED = "Docker Hub API returned";
export const ERROR_NO_TAGS_FOUND = "No tags found for";
export const ERROR_NO_SEMVER_TAGS = "No semantic version tags found for";
export const ERROR_FAILED_TO_FETCH_VERSION = "Failed to get latest version for";

// Info/warning messages
export const MSG_SUCCESSFULLY_COPIED_GITHUB = "Successfully copied GitHub output from branch: ";

// ============================================================================
// Test Output Messages
// ============================================================================
export const MSG_TESTS_FAILED_TEMPLATE = (count: number) => `${count} test(s) failed`;
