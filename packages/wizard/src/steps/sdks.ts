import { execFile } from "child_process";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { isMap, isSeq, parse, parseDocument } from "yaml";

// Which SDK languages a Fern project generates, and where each one is written.

export interface SdkLanguage {
    label: string;
    /** Generator name as written in generators.yml. */
    generator: string;
    /** Other generator names that produce the same language. */
    aliases?: string[];
    /** Whether the Free plan includes this language; the rest need the Enterprise plan. */
    free: boolean;
}

export const SDK_LANGUAGES: SdkLanguage[] = [
    {
        label: "TypeScript",
        generator: "fern-typescript-sdk",
        aliases: ["fern-typescript-node-sdk", "fern-typescript-browser-sdk"],
        free: true
    },
    { label: "Python", generator: "fern-python-sdk", free: true },
    { label: "Go", generator: "fern-go-sdk", free: false },
    { label: "Java", generator: "fern-java-sdk", free: false },
    { label: "C#", generator: "fern-csharp-sdk", free: false },
    { label: "Ruby", generator: "fern-ruby-sdk", free: false },
    { label: "PHP", generator: "fern-php-sdk", free: false },
    { label: "Swift", generator: "fern-swift-sdk", free: false },
    { label: "Rust", generator: "fern-rust-sdk", free: false }
];

export interface ConfiguredSdk {
    language: SdkLanguage;
    /** Absolute output directory, when the generator writes to the local file system. */
    outputPath?: string;
}

/** The SDK generators in fern/generators.yml's SDK group (see sdkGroupName). */
export async function readConfiguredSdks(dir: string): Promise<ConfiguredSdk[]> {
    const fernDir = path.join(dir, "fern");
    return (await readSdkGroupGenerators(dir)).flatMap((generator): ConfiguredSdk[] => {
        if (!isRecord(generator) || typeof generator.name !== "string") {
            return [];
        }
        const name = withoutImagePrefix(generator.name);
        const language = SDK_LANGUAGES.find(
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
 * Whether every generator in the SDK group writes into this repository. Any other output (npm, PyPI,
 * GitHub, …) publishes when `fern generate` runs, so the wizard leaves generating those to the user.
 */
export async function sdkGroupWritesOnlyLocally(dir: string): Promise<boolean> {
    return (await readSdkGroupGenerators(dir)).every(
        (generator) =>
            isRecord(generator) && isRecord(generator.output) && generator.output.location === "local-file-system"
    );
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

/** Whether Docker is running, so SDKs can be generated on this machine. */
export async function isDockerRunning(): Promise<boolean> {
    return new Promise((resolve) => {
        execFile("docker", ["info"], { timeout: 10000 }, (error) => resolve(error === null));
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
