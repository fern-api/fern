import { access, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { isMap, isSeq, parse, parseDocument } from "yaml";

// Which SDKs (and CLI or MCP server) a Fern project generates, and where each one is written. New
// projects list them as targets in fern/sdk-config.yml; older ones as generators in fern/generators.yml.

export interface SdkLanguage {
    label: string;
    /** How the wizard names what it generates, like "TypeScript SDK" or "CLI". */
    displayName: string;
    /** Generator name as written in generators.yml. */
    generator: string;
    /** Other generator names that produce the same language. */
    aliases?: string[];
    /** The target's `language` in sdk-config.yml. */
    target: string;
    /** Whether the Free plan includes this language; the rest need the Enterprise plan. */
    free: boolean;
    /** Where a new target writes, relative to the repository root. Defaults to sdks/<target>. */
    outputDirectory?: string;
}

export const SDK_LANGUAGES: SdkLanguage[] = [
    {
        label: "TypeScript",
        displayName: "TypeScript SDK",
        generator: "fern-typescript-sdk",
        aliases: ["fern-typescript-node-sdk", "fern-typescript-browser-sdk"],
        target: "typescript",
        free: true
    },
    { label: "Python", displayName: "Python SDK", generator: "fern-python-sdk", target: "python", free: true },
    { label: "Go", displayName: "Go SDK", generator: "fern-go-sdk", target: "go", free: false },
    { label: "Java", displayName: "Java SDK", generator: "fern-java-sdk", target: "java", free: false },
    { label: "C#", displayName: "C# SDK", generator: "fern-csharp-sdk", target: "csharp", free: false },
    {
        label: "Ruby",
        displayName: "Ruby SDK",
        generator: "fern-ruby-sdk",
        aliases: ["fern-ruby-sdk-v2"],
        target: "ruby",
        free: false
    },
    { label: "PHP", displayName: "PHP SDK", generator: "fern-php-sdk", target: "php", free: false },
    { label: "Swift", displayName: "Swift SDK", generator: "fern-swift-sdk", target: "swift", free: false },
    { label: "Rust", displayName: "Rust SDK", generator: "fern-rust-sdk", target: "rust", free: false }
];

/** Besides SDKs, Fern generates a CLI and an MCP server for an API, each its own sdk-config.yml target. */
export const CLI_TARGET: SdkLanguage = {
    label: "CLI",
    displayName: "CLI",
    generator: "fern-cli-generator",
    target: "cli",
    free: true,
    outputDirectory: "cli"
};

export const MCP_SERVER_TARGET: SdkLanguage = {
    label: "MCP server",
    displayName: "MCP server",
    generator: "fern-mcp-server",
    target: "mcp",
    free: true,
    outputDirectory: "mcp-server"
};

const ALL_TARGETS: SdkLanguage[] = [...SDK_LANGUAGES, CLI_TARGET, MCP_SERVER_TARGET];

const SDK_CONFIG_FILENAME = "sdk-config.yml";

/** Where the Fern CLI writes a `files` target that names no path, relative to sdk-config.yml. */
const DEFAULT_SDK_CONFIG_OUTPUT_DIRECTORY = "generated";

export interface ConfiguredSdk {
    language: SdkLanguage;
    /** Absolute output directory, when the generator writes to the local file system. */
    outputPath?: string;
}

/** The SDKs `fern generate` builds: fern/sdk-config.yml's targets and fern/generators.yml's SDK group. */
export async function readConfiguredSdks(dir: string): Promise<ConfiguredSdk[]> {
    return [...(await readSdkConfigTargets(dir)), ...(await readLegacySdks(dir))];
}

/** Whether the project lists its SDKs in fern/sdk-config.yml, as `fern init` sets up new projects. */
export async function usesSdkConfig(dir: string): Promise<boolean> {
    try {
        await access(path.join(dir, "fern", SDK_CONFIG_FILENAME));
        return true;
    } catch {
        return false;
    }
}

/** The targets in fern/sdk-config.yml, and where each one writes. */
async function readSdkConfigTargets(dir: string): Promise<ConfiguredSdk[]> {
    const config = await readSdkConfig(dir);
    if (config === undefined || !Array.isArray(config.targets)) {
        return [];
    }
    const fernDir = path.join(dir, "fern");
    return config.targets.flatMap((target): ConfiguredSdk[] => {
        if (!isRecord(target)) {
            return [];
        }
        const language = ALL_TARGETS.find((candidate) => candidate.target === target.language);
        if (language === undefined) {
            return [];
        }
        const output = targetOutput(config, target);
        const outputPath =
            output?.delivery === "files"
                ? path.resolve(
                      fernDir,
                      typeof output.path === "string"
                          ? output.path
                          : `${DEFAULT_SDK_CONFIG_OUTPUT_DIRECTORY}/${language.target}`
                  )
                : undefined;
        return [{ language, outputPath }];
    });
}

/** A target's output, which falls back to the file's top-level output. */
function targetOutput(
    config: Record<string, unknown>,
    target: Record<string, unknown>
): Record<string, unknown> | undefined {
    if (isRecord(target.output)) {
        return target.output;
    }
    return isRecord(config.output) ? config.output : undefined;
}

async function readSdkConfig(dir: string): Promise<Record<string, unknown> | undefined> {
    try {
        const config: unknown = parse(await readFile(path.join(dir, "fern", SDK_CONFIG_FILENAME), "utf8"));
        return isRecord(config) ? config : undefined;
    } catch {
        // No sdk-config.yml.
        return undefined;
    }
}

/**
 * Adds a target for each language to fern/sdk-config.yml, writing into sdks/<language>/ (or the
 * target's own folder, like cli/) in this repository. Targets pin no generator version, so Fern uses
 * the newest one.
 */
export async function addSdkConfigTargets(dir: string, languages: SdkLanguage[]): Promise<void> {
    if (languages.length === 0) {
        return;
    }
    const configPath = path.join(dir, "fern", SDK_CONFIG_FILENAME);
    const document = parseDocument(await readFile(configPath, "utf8"));
    const existing = document.get("targets");
    const targets = languages.map((language) => ({
        language: language.target,
        output: { delivery: "files", path: `../${language.outputDirectory ?? `sdks/${language.target}`}` }
    }));
    if (isSeq(existing)) {
        for (const target of targets) {
            existing.add(document.createNode(target));
        }
    } else {
        document.set("targets", targets);
    }
    await writeFile(configPath, document.toString());
}

/** The SDK generators in fern/generators.yml's SDK group (see sdkGroupName). */
async function readLegacySdks(dir: string): Promise<ConfiguredSdk[]> {
    const fernDir = path.join(dir, "fern");
    return (await readSdkGroupGenerators(dir)).flatMap((generator): ConfiguredSdk[] => {
        if (!isRecord(generator) || typeof generator.name !== "string") {
            return [];
        }
        const name = withoutImagePrefix(generator.name);
        const language = ALL_TARGETS.find(
            (candidate) => candidate.generator === name || candidate.aliases?.includes(name) === true
        );
        if (language === undefined) {
            return [];
        }
        const output = isRecord(generator.output) ? generator.output : undefined;
        const outputPath =
            output?.location === "local-file-system" && typeof output.path === "string"
                ? path.resolve(fernDir, output.path)
                : undefined;
        return [{ language, outputPath }];
    });
}

/** The generators in fern/generators.yml's SDK group, as written. */
async function readSdkGroupGenerators(dir: string): Promise<unknown[]> {
    let config: unknown;
    try {
        config = parse(await readFile(path.join(dir, "fern", "generators.yml"), "utf8"));
    } catch {
        // No generators.yml yet.
        return [];
    }
    if (!isRecord(config) || !isRecord(config.groups)) {
        return [];
    }
    const groupName = sdkGroupName(config);
    const group = groupName === undefined ? undefined : config.groups[groupName];
    return isRecord(group) && Array.isArray(group.generators) ? group.generators : [];
}

/**
 * Whether every SDK writes into this repository. Any other output (npm, PyPI, GitHub, …) publishes
 * when `fern generate` runs, so the wizard leaves generating those to the user.
 */
export async function sdksWriteOnlyLocally(dir: string): Promise<boolean> {
    const legacyLocal = (await readSdkGroupGenerators(dir)).every(
        (generator) =>
            isRecord(generator) && isRecord(generator.output) && generator.output.location === "local-file-system"
    );
    const config = await readSdkConfig(dir);
    const targets = config !== undefined && Array.isArray(config.targets) ? config.targets : [];
    const targetsLocal = targets.every((target) => {
        if (config === undefined || !isRecord(target)) {
            return false;
        }
        // No output downloads the files; `files` and `zip` stay local unless they also publish.
        const output = targetOutput(config, target);
        return (
            output === undefined ||
            ((output.delivery === "files" || output.delivery === "zip") && output.publish === undefined)
        );
    });
    return legacyLocal && targetsLocal;
}

/** Changes a generator's pinned version in fern/generators.yml. Returns whether anything changed. */
export async function setGeneratorVersion(dir: string, generator: string, from: string, to: string): Promise<boolean> {
    const generatorsPath = path.join(dir, "fern", "generators.yml");
    let contents: string;
    try {
        contents = await readFile(generatorsPath, "utf8");
    } catch {
        // No generators.yml.
        return false;
    }
    const document = parseDocument(contents);
    const groups = document.get("groups");
    if (!isMap(groups)) {
        return false;
    }
    let changed = false;
    for (const group of groups.items) {
        const generators = isMap(group.value) ? group.value.get("generators") : undefined;
        if (!isSeq(generators)) {
            continue;
        }
        for (const item of generators.items) {
            if (
                isMap(item) &&
                withoutImagePrefix(String(item.get("name"))) === withoutImagePrefix(generator) &&
                String(item.get("version")) === from
            ) {
                item.set("version", to);
                changed = true;
            }
        }
    }
    if (changed) {
        await writeFile(generatorsPath, document.toString());
    }
    return changed;
}

/** Whether a folder exists and has something in it. */
export async function isNonEmptyDirectory(dirPath: string): Promise<boolean> {
    try {
        return (await readdir(dirPath)).length > 0;
    } catch {
        return false;
    }
}

/** Generator names appear both with and without their Docker image prefix. */
function withoutImagePrefix(name: string): string {
    return name.replace(/^fernapi\//, "");
}

/** The default group, or the first group when none is the default. */
function sdkGroupName(config: Record<string, unknown>): string | undefined {
    if (typeof config["default-group"] === "string") {
        return config["default-group"];
    }
    return isRecord(config.groups) ? Object.keys(config.groups)[0] : undefined;
}

/**
 * The fern/generators.yml group to add SDKs to and generate. A project without groups gets a "local"
 * default group, like `fern init` writes. Undefined when there's no fern/generators.yml.
 */
export async function ensureSdkGroup(dir: string): Promise<string | undefined> {
    const generatorsPath = path.join(dir, "fern", "generators.yml");
    let contents: string;
    try {
        contents = await readFile(generatorsPath, "utf8");
    } catch {
        // No generators.yml.
        return undefined;
    }
    const document = parseDocument(contents);
    const config: unknown = document.toJS();
    const existing = isRecord(config) ? sdkGroupName(config) : undefined;
    if (existing !== undefined) {
        return existing;
    }
    document.set("default-group", "local");
    await writeFile(generatorsPath, document.toString());
    return "local";
}

/** The API folders under fern/apis/, when the project defines several APIs. */
export async function listApis(dir: string): Promise<string[]> {
    try {
        const entries = await readdir(path.join(dir, "fern", "apis"), { withFileTypes: true });
        return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch {
        // A single-API project.
        return [];
    }
}

/** The Fern organization in fern/fern.config.json. */
export async function readOrganization(dir: string): Promise<string | undefined> {
    try {
        const config: unknown = JSON.parse(await readFile(path.join(dir, "fern", "fern.config.json"), "utf8"));
        return isRecord(config) && typeof config.organization === "string" ? config.organization : undefined;
    } catch {
        // No Fern project.
        return undefined;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
