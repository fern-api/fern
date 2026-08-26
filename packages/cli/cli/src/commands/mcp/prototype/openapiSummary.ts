import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export interface EndpointSummary {
    method: string;
    path: string;
    operationId: string | undefined;
    tags: string[];
    summary: string | undefined;
    description: string | undefined;
    /** Rough estimate of the tokens this endpoint costs as a tool definition. */
    estimatedTokens: number;
}

export interface SpecSummary {
    absoluteFilePath: string;
    title: string | undefined;
    endpoints: EndpointSummary[];
    securitySchemeNames: string[];
}

/** Baseline token overhead per tool (name, wrapper JSON, annotations). */
const PER_TOOL_TOKEN_OVERHEAD = 60;
/** Rough chars-per-token ratio for JSON schema content. */
const CHARS_PER_TOKEN = 4;

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is string => typeof item === "string");
}

function asOptionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function parseSpecDocument(contents: string, filepath: string): Record<string, unknown> | undefined {
    try {
        const parsed = filepath.endsWith(".json") ? JSON.parse(contents) : yaml.load(contents);
        return isRecord(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function isOpenApiDocument(document: Record<string, unknown>): boolean {
    return (document.openapi != null || document.swagger != null) && isRecord(document.paths);
}

function summarizeEndpoints(document: Record<string, unknown>): EndpointSummary[] {
    const endpoints: EndpointSummary[] = [];
    const paths = isRecord(document.paths) ? document.paths : {};
    for (const [endpointPath, pathItem] of Object.entries(paths)) {
        if (!isRecord(pathItem)) {
            continue;
        }
        for (const method of HTTP_METHODS) {
            const operation = pathItem[method];
            if (!isRecord(operation)) {
                continue;
            }
            const operationSize = JSON.stringify(operation).length;
            endpoints.push({
                method: method.toUpperCase(),
                path: endpointPath,
                operationId: asOptionalString(operation.operationId),
                tags: asStringArray(operation.tags),
                summary: asOptionalString(operation.summary),
                description: asOptionalString(operation.description),
                estimatedTokens: Math.round(operationSize / CHARS_PER_TOKEN) + PER_TOOL_TOKEN_OVERHEAD
            });
        }
    }
    return endpoints;
}

function getSecuritySchemeNames(document: Record<string, unknown>): string[] {
    const components = isRecord(document.components) ? document.components : {};
    const securitySchemes = isRecord(components.securitySchemes) ? components.securitySchemes : {};
    return Object.keys(securitySchemes);
}

function getTitle(document: Record<string, unknown>): string | undefined {
    const info = isRecord(document.info) ? document.info : {};
    return asOptionalString(info.title);
}

async function listCandidateSpecFiles(workspaceDirectory: string): Promise<string[]> {
    const candidates: string[] = [];
    const directoriesToScan = [workspaceDirectory, path.join(workspaceDirectory, "openapi")];
    for (const directory of directoriesToScan) {
        let entries;
        try {
            entries = await readdir(directory, { withFileTypes: true });
        } catch {
            continue;
        }
        for (const entry of entries) {
            if (entry.isFile() && /\.(ya?ml|json)$/.test(entry.name) && !entry.name.startsWith("generators")) {
                candidates.push(path.join(directory, entry.name));
            }
        }
    }
    return candidates;
}

/**
 * Finds and summarizes the OpenAPI spec(s) in a fern workspace directory.
 * Scans the workspace directory (and an `openapi/` subdirectory) for
 * YAML/JSON files that look like OpenAPI documents.
 */
export async function loadSpecSummaries(workspaceDirectory: string): Promise<SpecSummary[]> {
    const summaries: SpecSummary[] = [];
    for (const filepath of await listCandidateSpecFiles(workspaceDirectory)) {
        let contents: string;
        try {
            contents = await readFile(filepath, "utf-8");
        } catch {
            continue;
        }
        const document = parseSpecDocument(contents, filepath);
        if (document == null || !isOpenApiDocument(document)) {
            continue;
        }
        summaries.push({
            absoluteFilePath: filepath,
            title: getTitle(document),
            endpoints: summarizeEndpoints(document),
            securitySchemeNames: getSecuritySchemeNames(document)
        });
    }
    return summaries;
}
