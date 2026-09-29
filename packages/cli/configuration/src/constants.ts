export const FERN_DIRECTORY = "fern";
export const DEFINITION_DIRECTORY = "definition";
export const OPENAPI_DIRECTORY = "openapi";
export const CHANGELOG_DIRECTORY = "changelog";
export const ASYNCAPI_DIRECTORY = "asyncapi";
export const ROOT_API_FILENAME = "api.yml";
export const FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION = "__package__";
export const FERN_PACKAGE_MARKER_FILENAME = `${FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION}.yml`;
export const DEPENDENCIES_FILENAME = "dependencies.yml";
export const GENERATORS_CONFIGURATION_FILENAME = "generators.yml";
export const GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE = "generators.yaml";
/**
 * Filename used by projects that keep legacy generator groups alongside SDK Config.
 *
 * Keep this name centralized: the migration filename is intentionally provisional, and
 * configuration discovery should not require a repository-wide rewrite if it changes.
 */
export const LEGACY_GENERATORS_CONFIGURATION_FILENAME = "generators.legacy.yml";
export const SDK_CONFIG_FILENAME = "sdk-config.yml";
export const DEPENDENCIES_CONFIGURATION_FILENAME = "dependencies.yml";
export const DOCS_CONFIGURATION_FILENAME = "docs.yml";
export const PROJECT_CONFIG_FILENAME = "fern.config.json";
export const DEFAULT_API_WORKSPACE_FOLDER_NAME = "api";
export const FERNIGNORE_FILENAME = ".fernignore";
export const SNIPPET_JSON_FILENAME = "snippet.json";
export const SNIPPET_TEMPLATES_JSON_FILENAME = "snippet-templates.json";
export const RESOLVED_SNIPPET_TEMPLATES_MD = "resolved-snippet-templates.md";
export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const API_ORIGIN_LOCATION_KEY = "spec-origin";
export const ASYNC_API_LOCATION_KEY = "async-api";
export const OPENAPI_LOCATION_KEY = "openapi";
export const OPENAPI_OVERRIDES_LOCATION_KEY = "openapi-overrides";
export const API_SETTINGS_KEY = "api-settings";

export const DOCS_DIRECTORY = "docs";
export const APIS_DIRECTORY = "apis";

export const DEFAULT_GROUP_NAME = "local";
