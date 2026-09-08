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
 * Filename, relative to the generator's output directory, that the Go (v1)
 * generator writes its cycle-breaking type relocations to when
 * {@link TYPE_RELOCATIONS_OUTPUT_FILEPATH_ENV_VAR} is set. The output directory
 * is host-readable in every execution environment (bind mount, `docker cp`, or
 * native), so the host-side dynamic snippet test generator can apply the same
 * relocations the generator did. The file is deleted before generated output is
 * copied to its final location, so it never ships in an SDK.
 */
export const TYPE_RELOCATIONS_FILENAME = ".fern-type-relocations.json";

/**
 * Environment variable telling the generator where to additionally write its
 * cycle-breaking type relocations. Must match `typeRelocationsOutputFilepathEnvVar`
 * in `generators/go/internal/generator/generator.go`.
 */
export const TYPE_RELOCATIONS_OUTPUT_FILEPATH_ENV_VAR = "FERN_TYPE_RELOCATIONS_OUTPUT_FILEPATH";

/**
 * The version at which each Fern generator name becomes the Postman on-prem adapter.
 *
 * The adapter is published under the Fern generator names it replaces, at the version its language
 * carries in Postman's cutover matrix, so a customer keeps their `generators.yml` entry and changes
 * only the version. The name is therefore identical whether the image is Fern's or Postman's, and
 * the version is the only thing that distinguishes them — a name allowlist cannot express this.
 *
 * One language maps to several names (TypeScript has two), which is why this is keyed on name.
 * `kotlin` and `cli` have cutover versions but no Fern generator the adapter is a drop-in for, so
 * they are absent by design.
 */
const ONPREM_ADAPTER_CUTOVER: ReadonlyMap<string, string> = new Map([
    ["fernapi/fern-typescript-sdk", "4.0.0"],
    ["fernapi/fern-typescript-node-sdk", "4.0.0"],
    ["fernapi/fern-python-sdk", "6.0.0"],
    ["fernapi/fern-java-sdk", "5.0.0"],
    ["fernapi/fern-go-sdk", "2.0.0"],
    ["fernapi/fern-csharp-sdk", "3.0.0"],
    ["fernapi/fern-php-sdk", "3.0.0"],
    ["fernapi/fern-ruby-sdk", "2.0.0"],
    ["fernapi/fern-rust-sdk", "1.0.0"],
    ["fernapi/fern-swift-sdk", "1.0.0"]
]);

/**
 * The language the adapter generates, derived from the generator name.
 *
 * The adapter bakes one language into each image, and under the cutover naming the generator name
 * already identifies it — so nothing has to be declared in `generators.yml`.
 */
const ONPREM_ADAPTER_LANGUAGE: ReadonlyMap<string, string> = new Map([
    ["fernapi/fern-typescript-sdk", "typescript"],
    ["fernapi/fern-typescript-node-sdk", "typescript"],
    ["fernapi/fern-python-sdk", "python"],
    ["fernapi/fern-java-sdk", "java"],
    ["fernapi/fern-go-sdk", "go"],
    ["fernapi/fern-csharp-sdk", "csharp"],
    ["fernapi/fern-php-sdk", "php"],
    ["fernapi/fern-ruby-sdk", "ruby"],
    ["fernapi/fern-rust-sdk", "rust"],
    ["fernapi/fern-swift-sdk", "swift"]
]);

/** Numeric comparison of dot-separated leading integers. Falls back to 0 for a non-numeric part. */
function compareVersions(left: string, right: string): number {
    const leftParts = left.split(".");
    const rightParts = right.split(".");
    for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
        const l = Number.parseInt(leftParts[index] ?? "0", 10) || 0;
        const r = Number.parseInt(rightParts[index] ?? "0", 10) || 0;
        if (l !== r) {
            return l < r ? -1 : 1;
        }
    }
    return 0;
}

/**
 * Whether this generator invocation resolves to the Postman on-prem adapter rather than Fern's own
 * generator of the same name.
 *
 * A prerelease is treated as its release version, so `4.0.0-rc1` is on the adapter side of the
 * cutover — an rc of the adapter is still the adapter.
 */
export function isOnPremAdapter(generatorName: string, version: string): boolean {
    const cutover = ONPREM_ADAPTER_CUTOVER.get(generatorName);
    if (cutover == null) {
        return false;
    }
    const release = version.split("-")[0] ?? version;
    return compareVersions(release, cutover) >= 0;
}

export function onPremAdapterLanguage(generatorName: string): string | undefined {
    return ONPREM_ADAPTER_LANGUAGE.get(generatorName);
}

/**
 * Generators that receive pre-processed raw API spec files mounted into their
 * Docker container. Add new generator names here as they opt in.
 *
 * Prefer the label below for new images. A name allowlist cannot describe an image that is published
 * under an existing generator name in a different registry, which is how a self-hosted adapter is
 * configured -- the name is identical whether the image is Fern's or the vendor's.
 */
const GENERATORS_WANTING_SPECS: ReadonlySet<string> = new Set(["fernapi/fern-cli-generator"]);

export function generatorWantsSpecs(generatorName: string, version?: string): boolean {
    if (GENERATORS_WANTING_SPECS.has(generatorName)) {
        return true;
    }
    // The adapter generates from the spec rather than the Fern IR, so it needs the same mount.
    return version != null && isOnPremAdapter(generatorName, version);
}

/** Generators handed SDK Config IR at the container config path in place of Fern's `GeneratorConfig`. */
export function generatorWantsSdkConfigIr(generatorName: string, version: string): boolean {
    return isOnPremAdapter(generatorName, version);
}

/**
 * The image reference a generator invocation resolves to. Structurally typed so every caller agrees
 * on exactly which image is run.
 */
export function resolveGeneratorImage(generatorInvocation: {
    containerImage: string | undefined;
    name: string;
    version: string;
}): string {
    const repository = generatorInvocation.containerImage ?? generatorInvocation.name;
    // A digest already identifies an exact image, and `repo@sha256:...:1.2.3` is not a valid
    // reference. Appending the version would also defeat the point of pinning.
    if (repository.includes("@sha256:")) {
        return repository;
    }
    return `${repository}:${generatorInvocation.version}`;
}

/**
 * Opts a local generation run into a specific container network mode, `none` being the useful value.
 *
 * An environment variable rather than a generators.yml key so the switch exists without a schema
 * change; a first-class config field or CLI flag is the natural follow-up if that is preferred.
 */
export const GENERATOR_NETWORK_ENV_VAR = "FERN_GENERATOR_NETWORK";

export function getConfiguredGeneratorNetwork(env: NodeJS.ProcessEnv = process.env): string | undefined {
    const value = env[GENERATOR_NETWORK_ENV_VAR]?.trim();
    return value !== undefined && value !== "" ? value : undefined;
}
