import path from "path";

export const DOCKER_FERN_DIRECTORY = "/fern";
export const CODEGEN_OUTPUT_DIRECTORY_NAME = "output";
export const GENERATOR_CONFIG_FILENAME = "config.json";
export const IR_FILENAME = "ir.json";
export const SNIPPET_FILENAME = "snippet.json";
export const SNIPPET_TEMPLATES_FILENAME = "snippet-templates.json";
export const GENERATORS_DIRECTORY_NAME = "generators";
export const SOURCES_DIRECTORY_NAME = "sources";
export const SPECS_DIRECTORY_NAME = "specs";
export const SPECS_MANIFEST_FILENAME = "specs-manifest.json";

export const DOCKER_CODEGEN_OUTPUT_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, CODEGEN_OUTPUT_DIRECTORY_NAME);
export const DOCKER_GENERATOR_CONFIG_PATH = path.join(DOCKER_FERN_DIRECTORY, GENERATOR_CONFIG_FILENAME);
export const DOCKER_PATH_TO_IR = path.join(DOCKER_FERN_DIRECTORY, IR_FILENAME);
export const DOCKER_PATH_TO_SNIPPET = path.join(DOCKER_FERN_DIRECTORY, SNIPPET_FILENAME);
export const DOCKER_PATH_TO_SNIPPET_TEMPLATES = path.join(DOCKER_FERN_DIRECTORY, SNIPPET_TEMPLATES_FILENAME);
export const DOCKER_GENERATORS_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, GENERATORS_DIRECTORY_NAME);
export const DOCKER_SOURCES_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, SOURCES_DIRECTORY_NAME);

export const CONTAINER_FERN_DIRECTORY = DOCKER_FERN_DIRECTORY;
export const CONTAINER_CODEGEN_OUTPUT_DIRECTORY = DOCKER_CODEGEN_OUTPUT_DIRECTORY;
export const CONTAINER_GENERATOR_CONFIG_PATH = DOCKER_GENERATOR_CONFIG_PATH;
export const CONTAINER_PATH_TO_IR = DOCKER_PATH_TO_IR;
export const CONTAINER_PATH_TO_SNIPPET = DOCKER_PATH_TO_SNIPPET;
export const CONTAINER_PATH_TO_SNIPPET_TEMPLATES = DOCKER_PATH_TO_SNIPPET_TEMPLATES;
export const CONTAINER_GENERATORS_DIRECTORY = DOCKER_GENERATORS_DIRECTORY;
export const CONTAINER_SOURCES_DIRECTORY = DOCKER_SOURCES_DIRECTORY;

export const DOCKER_SPECS_DIRECTORY = path.join(DOCKER_FERN_DIRECTORY, SPECS_DIRECTORY_NAME);
export const CONTAINER_SPECS_DIRECTORY = DOCKER_SPECS_DIRECTORY;

export const DEFAULT_NODE_DEBUG_PORT = "9229";

/**
 * Generators that receive pre-processed raw API spec files mounted into their
 * Docker container. Add new generator names here as they opt in.
 */
const GENERATORS_WANTING_SPECS: ReadonlySet<string> = new Set(["fernapi/fern-cli"]);

export function generatorWantsSpecs(generatorName: string): boolean {
    return GENERATORS_WANTING_SPECS.has(generatorName);
}

/**
 * Python generators that use Poetry for dependency management. When running
 * in GitHub output mode, their `poetry.lock` must be resolved AFTER the
 * PostGenerationPipeline applies customizations (replay patches, .fernignore).
 */
const POETRY_GENERATORS: ReadonlySet<string> = new Set([
    "fernapi/fern-python-sdk",
    "fernapi/fern-fastapi-server",
    "fernapi/fern-pydantic-model"
]);

export function generatorUsesPoetry(generatorName: string): boolean {
    return POETRY_GENERATORS.has(generatorName);
}
