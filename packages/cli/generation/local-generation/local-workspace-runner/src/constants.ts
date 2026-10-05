import path from "path";
import semver from "semver";

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
 * Each Fern generator name the Postman on-prem adapter is published under: the language that image
 * bakes in, and the version at which the name starts meaning the adapter rather than Fern's own
 * generator.
 *
 * The adapter is published under the Fern generator names it replaces, at the version its language
 * carries in Postman's cutover matrix, so a customer keeps their `generators.yml` entry and changes
 * only the version. The name is therefore identical whether the image is Fern's or Postman's, and
 * the version is the only thing that distinguishes them — a name allowlist cannot express this.
 *
 * One language maps to several names (TypeScript has two), which is why this is keyed on name and
 * carries the language as a value rather than the other way round. `kotlin` and `cli` have cutover
 * versions but no Fern generator the adapter is a drop-in for, so they are absent by design.
 *
 * Language and cutover live in one entry so they cannot drift apart: every name that has a cutover
 * necessarily has a language, and vice versa.
 *
 * The cutovers assume **Fern never publishes a version at or above a cutover major under these
 * names** — including a prerelease, since `2.0.0-rc.1` coerces to `2.0.0`. Each cutover currently
 * sits one major above Fern's release, so there is room, but the invariant is an agreement between
 * two release processes rather than something this file can enforce. An explicit registry check is
 * the durable fix if the adapter ever ships somewhere other than `fernapi`.
 */
const ONPREM_ADAPTER: ReadonlyMap<string, { language: string; cutover: string }> = new Map([
    ["fernapi/fern-typescript-sdk", { language: "typescript", cutover: "4.0.0" }],
    ["fernapi/fern-typescript-node-sdk", { language: "typescript", cutover: "4.0.0" }],
    ["fernapi/fern-python-sdk", { language: "python", cutover: "6.0.0" }],
    ["fernapi/fern-java-sdk", { language: "java", cutover: "5.0.0" }],
    ["fernapi/fern-go-sdk", { language: "go", cutover: "2.0.0" }],
    ["fernapi/fern-csharp-sdk", { language: "csharp", cutover: "3.0.0" }],
    ["fernapi/fern-php-sdk", { language: "php", cutover: "3.0.0" }],
    ["fernapi/fern-ruby-sdk", { language: "ruby", cutover: "2.0.0" }],
    ["fernapi/fern-rust-sdk", { language: "rust", cutover: "1.0.0" }],
    ["fernapi/fern-swift-sdk", { language: "swift", cutover: "1.0.0" }]
]);

/**
 * Whether this invocation is Postman's on-prem adapter rather than Fern's own generator of the same
 * name — which is what decides that the container is configured from `sdk-config.yml` and handed SDK
 * Config IR, instead of from `generators.yml` and handed a Fern `GeneratorConfig`.
 *
 * `false` for every generator Fern ships today. It becomes true only for the names in
 * {@link ONPREM_ADAPTER}, and only at or above the version recorded there.
 *
 * Two version cases are decided deliberately rather than by accident of parsing:
 *
 * - A **prerelease** counts as its release, so `4.0.0-rc1` is the adapter — an rc of the adapter is
 *   still the adapter. This holds only while Fern publishes no prerelease at or above a cutover
 *   major under these names.
 * - A version semver **cannot read at all**, `latest` above all — which is what `fern sdk generate`
 *   defaults to — is Fern's generator. Selecting the adapter is an explicit act, since the design is
 *   "keep your generators.yml entry and change only the version", so naming no version is not
 *   opting in. Safe only while the adapter is not published into `fernapi` under a moving tag; if it
 *   ever is, this needs a registry check rather than a version comparison.
 */
export function isOnPremAdapter(generatorName: string, version: string): boolean {
    const entry = ONPREM_ADAPTER.get(generatorName);
    if (entry == null) {
        return false;
    }
    const parsed = semver.coerce(version);
    if (parsed == null) {
        return false;
    }
    return semver.gte(parsed, entry.cutover);
}

export function onPremAdapterLanguage(generatorName: string): string | undefined {
    return ONPREM_ADAPTER.get(generatorName)?.language;
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
 * Runs the adapter's current pre-release instead of the version a workspace asks for.
 *
 * For following the adapter internally before its release versions exist. Postman publishes one
 * moving `rc` tag per language, so this needs no version: whatever `rc` points at is the newest
 * pre-release of that language.
 *
 * An environment variable rather than a generators.yml key or a flag, because it is a property of
 * who is running rather than of the workspace — the same configuration has to work for a customer on
 * a release version and for us on a pre-release, without the file differing.
 */
export const USE_FERN_RC_ENV_VAR = "USE_FERN_RC";

export function usesOnPremAdapterPrerelease(env: NodeJS.ProcessEnv = process.env): boolean {
    const value = env[USE_FERN_RC_ENV_VAR]?.trim().toLowerCase();
    return value === "true" || value === "1";
}

/** Default namespace Postman publishes the on-prem adapter under. */
const DEFAULT_ONPREM_ADAPTER_NAMESPACE = "fernenterprise";

/**
 * Overrides the namespace the adapter's pre-release is pulled from, for pointing a run at a staging
 * registry or a personal namespace without editing generators.yml.
 */
export const ONPREM_ADAPTER_NAMESPACE_ENV_VAR = "FERN_RC_NAMESPACE";

export function getOnPremAdapterNamespace(env: NodeJS.ProcessEnv = process.env): string {
    const value = env[ONPREM_ADAPTER_NAMESPACE_ENV_VAR]?.trim();
    return value !== undefined && value !== "" ? value : DEFAULT_ONPREM_ADAPTER_NAMESPACE;
}

/** The moving tag the adapter's publish workflow points at each language's newest pre-release. */
const ONPREM_ADAPTER_PRERELEASE_TAG = "rc";

/**
 * The image reference a generator invocation resolves to. Structurally typed so every caller agrees
 * on exactly which image is run.
 *
 * `ContainerExecutionEnvironment` logs what it is given, so a reference substituted here is the
 * reference reported in the run's output rather than the one the workspace asked for.
 */
export function resolveGeneratorImage(
    generatorInvocation: {
        containerImage: string | undefined;
        name: string;
        version: string;
    },
    env: NodeJS.ProcessEnv = process.env
): string {
    const repository = generatorInvocation.containerImage ?? generatorInvocation.name;
    // A digest already identifies an exact image, and `repo@sha256:...:1.2.3` is not a valid
    // reference. Appending the version would also defeat the point of pinning.
    if (repository.includes("@sha256:")) {
        return repository;
    }

    // Only the adapter has pre-releases to run, and only when this invocation already resolves to it:
    // a generator below the cutover is Fern's own, and Fern publishes no `rc` tag. A digest pin above
    // wins, because pinning an exact artifact is a deliberate act that this should not quietly undo.
    const language = onPremAdapterLanguage(generatorInvocation.name);
    if (
        language != null &&
        isOnPremAdapter(generatorInvocation.name, generatorInvocation.version) &&
        usesOnPremAdapterPrerelease(env)
    ) {
        return `${getOnPremAdapterNamespace(env)}/fern-${language}-sdk:${ONPREM_ADAPTER_PRERELEASE_TAG}`;
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
