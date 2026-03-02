#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { load as parseYaml } from "js-yaml";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { MINIMUM_SUPPORTED_IR_VERSION } from "../src/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "../../../../..");

interface YamlVersion {
    version: string;
    irVersion: number;
    createdAt?: string;
    changelogEntry?: unknown[];
}

interface GeneratorYamlFile {
    versions: YamlVersion[];
}

interface ProcessingResult {
    generatorVersions: Record<string, string>;
    processedCount: number;
    skippedCount: number;
    errors: ProcessingError[];
}

interface ProcessingError {
    file: string;
    error: Error;
}

// Type guards
function isGeneratorYamlFile(obj: unknown): obj is GeneratorYamlFile {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "versions" in obj &&
        Array.isArray((obj as GeneratorYamlFile).versions)
    );
}

function isYamlVersionArray(obj: unknown): obj is YamlVersion[] {
    return (
        Array.isArray(obj) &&
        obj.every((item) => typeof item === "object" && item !== null && "version" in item && "irVersion" in item)
    );
}

// Generator name mapping with cleaner structure
const GENERATOR_NAME_MAPPINGS = {
    // Single-level generators
    postman: () => "fernapi/fern-postman",
    openapi: () => "fernapi/fern-openapi",

    // Special type mappings
    express: () => "fernapi/fern-express",
    fastapi: () => "fernapi/fern-fastapi",
    spring: () => "fernapi/fern-spring",

    // Pydantic special case
    pydantic: () => "fernapi/fern-pydantic"
} as const;

function validateInputs(): void {
    if (!Number.isInteger(MINIMUM_SUPPORTED_IR_VERSION) || MINIMUM_SUPPORTED_IR_VERSION < 1) {
        throw new Error(
            `Invalid MINIMUM_SUPPORTED_IR_VERSION: ${MINIMUM_SUPPORTED_IR_VERSION}. Must be a positive integer.`
        );
    }
}

function getGeneratorName(yamlPath: string): string {
    const parts = yamlPath.split("/");
    if (parts.length < 3) {
        throw new Error(`Invalid generator path format: ${yamlPath}. Expected at least 3 path segments.`);
    }

    const langDir = parts[1]; // e.g., "go-v2", "python", "typescript", "postman", "openapi"
    const type = parts[2]; // e.g., "sdk", "model", "express", "versions.yml"

    // Handle tandem systems by removing -v2 suffix
    const lang = langDir.replace("-v2", "");

    // Handle single-level generators (postman, openapi)
    if (type === "versions.yml") {
        const mapper = GENERATOR_NAME_MAPPINGS[lang as keyof typeof GENERATOR_NAME_MAPPINGS];
        return mapper ? mapper() : `fernapi/fern-${lang}`;
    }

    // Check special type mappings
    const typeMapper = GENERATOR_NAME_MAPPINGS[type as keyof typeof GENERATOR_NAME_MAPPINGS];
    if (typeMapper) {
        return typeMapper();
    }

    // Default pattern: fernapi/fern-{lang}-{type}
    return `fernapi/fern-${lang}-${type}`;
}

function findMinimumVersion(versions: YamlVersion[]): string | null {
    // Process chronologically (oldest first) - YAML files are typically newest to oldest
    const sortedVersions = [...versions].reverse();

    for (const version of sortedVersions) {
        if (typeof version.irVersion === "number" && version.irVersion >= MINIMUM_SUPPORTED_IR_VERSION) {
            return version.version;
        }
    }

    return null;
}

async function parseYamlFile(filePath: string): Promise<YamlVersion[]> {
    const content = await readFile(filePath, "utf8");
    const parsed = parseYaml(content);

    // Handle both array format and object format with proper type guards
    if (isYamlVersionArray(parsed)) {
        return parsed;
    }

    if (isGeneratorYamlFile(parsed)) {
        return parsed.versions;
    }

    throw new Error(
        `Unexpected YAML format in ${filePath}. Expected array of versions or object with versions property.`
    );
}

async function discoverGeneratorFiles(): Promise<string[]> {
    const yamlFiles = await glob("generators/**/versions.yml", {
        cwd: PROJECT_ROOT,
        absolute: false,
        ignore: ["**/node_modules/**"]
    });

    if (yamlFiles.length === 0) {
        throw new Error(`No generator YAML files found in ${PROJECT_ROOT}/generators/`);
    }

    return yamlFiles;
}

async function processGeneratorFiles(yamlFiles: string[]): Promise<ProcessingResult> {
    const generatorVersions: Record<string, string> = {};
    const errors: ProcessingError[] = [];
    let processedCount = 0;
    let skippedCount = 0;

    for (const yamlFile of yamlFiles) {
        try {
            const generatorName = getGeneratorName(yamlFile);
            const fullPath = join(PROJECT_ROOT, yamlFile);
            const versions = await parseYamlFile(fullPath);

            if (versions.length === 0) {
                skippedCount++;
                continue;
            }

            const minVersion = findMinimumVersion(versions);
            if (minVersion !== null) {
                generatorVersions[generatorName] = minVersion;
                processedCount++;
            } else {
                skippedCount++;
            }
        } catch (error) {
            const processingError = error instanceof Error ? error : new Error(String(error));
            errors.push({ file: yamlFile, error: processingError });
            skippedCount++;
        }
    }

    return { generatorVersions, processedCount, skippedCount, errors };
}

function addLegacyGeneratorNames(generatorVersions: Record<string, string>): void {
    const typescriptSdkVersion = generatorVersions["fernapi/fern-typescript-sdk"];
    if (typescriptSdkVersion) {
        generatorVersions["fernapi/fern-typescript-node-sdk"] = typescriptSdkVersion;
        generatorVersions["fernapi/fern-typescript-browser-sdk"] = typescriptSdkVersion;
    }
}

function generateTypeScriptContent(generatorVersions: Record<string, string>): string {
    const timestamp = new Date().toISOString();

    return `// AUTO-GENERATED - DO NOT EDIT
// Generated by scripts/generate-version-map.ts from generators/*/versions.yml files
// Based on minimum IR version: ${MINIMUM_SUPPORTED_IR_VERSION}
// Last updated: ${timestamp}

import { MINIMUM_SUPPORTED_IR_VERSION } from '../constants.js';

export const GENERATOR_MINIMUM_VERSIONS: Record<string, string> = {
${Object.entries(generatorVersions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, version]) => `    "${name}": "${version}",`)
    .join("\n")}
};

// Re-export constant for convenience
export { MINIMUM_SUPPORTED_IR_VERSION };
`;
}

async function getOutputPath(): Promise<string> {
    return join(__dirname, `../src/generated/generatorVersionMap.v${MINIMUM_SUPPORTED_IR_VERSION}.ts`);
}

async function getOutputDir(): Promise<string> {
    return join(__dirname, "../src/generated");
}

async function shouldSkipGeneration(): Promise<boolean> {
    try {
        const outputPath = await getOutputPath();
        await readFile(outputPath, "utf8");

        // File exists with correct IR version in filename
        return true;
    } catch {
        // File doesn't exist with current IR version
        return false;
    }
}

async function writeGeneratedFile(content: string): Promise<void> {
    const outputDir = await getOutputDir();
    const outputPath = await getOutputPath();

    await mkdir(outputDir, { recursive: true });

    // Write both versioned (for caching) and stable (for imports) files
    const stablePath = join(outputDir, "generatorVersionMap.ts");
    await writeFile(outputPath, content);
    await writeFile(stablePath, content);
}

async function main(): Promise<void> {
    const forceRegenerate = process.argv.includes("--force");

    try {
        // Input validation
        validateInputs();

        // Check cache unless forced
        if (!forceRegenerate && (await shouldSkipGeneration())) {
            return; // Skip generation, using cached version
        }

        // Discover generator files
        const yamlFiles = await discoverGeneratorFiles();

        // Process all generator files
        const { generatorVersions, processedCount, skippedCount, errors } = await processGeneratorFiles(yamlFiles);

        // Handle critical errors
        if (errors.length > 0 && processedCount === 0) {
            throw new Error(`Failed to process any generators. Errors: ${errors.length}`);
        }

        // Add legacy generator names
        addLegacyGeneratorNames(generatorVersions);

        // Generate and write TypeScript file
        const content = generateTypeScriptContent(generatorVersions);
        await writeGeneratedFile(content);
    } catch (error) {
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
