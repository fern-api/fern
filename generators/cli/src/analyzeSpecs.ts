import { readFile } from "fs/promises";
import path from "path";
import {
    RAW_SPECS_DIRECTORY,
    RAW_SPECS_MANIFEST_FILENAME,
    type RawSpecsManifest,
    type RawSpecsManifestEntry
} from "./copySpecs.js";

interface SpecSummary {
    type: RawSpecsManifestEntry["type"];
    title: string | undefined;
    version: string | undefined;
    endpointCount: number;
    schemaCount: number;
    specPath: string;
}

export interface SpecAnalysis {
    totalSpecs: number;
    totalEndpoints: number;
    totalSchemas: number;
    specs: SpecSummary[];
}

export async function analyzeSpecs(rawSpecsDir?: string): Promise<SpecAnalysis> {
    const specsDir = rawSpecsDir ?? RAW_SPECS_DIRECTORY;
    const manifestPath = path.join(specsDir, RAW_SPECS_MANIFEST_FILENAME);

    let manifestContent: string;
    try {
        manifestContent = await readFile(manifestPath, "utf-8");
    } catch {
        return { totalSpecs: 0, totalEndpoints: 0, totalSchemas: 0, specs: [] };
    }

    const manifest: RawSpecsManifest = JSON.parse(manifestContent);
    if (manifest.specs.length === 0) {
        return { totalSpecs: 0, totalEndpoints: 0, totalSchemas: 0, specs: [] };
    }

    const specs: SpecSummary[] = [];
    let totalEndpoints = 0;
    let totalSchemas = 0;

    for (const entry of manifest.specs) {
        const summary = await analyzeSpecEntry(entry);
        totalEndpoints += summary.endpointCount;
        totalSchemas += summary.schemaCount;
        specs.push(summary);
    }

    return {
        totalSpecs: specs.length,
        totalEndpoints,
        totalSchemas,
        specs
    };
}

async function analyzeSpecEntry(entry: RawSpecsManifestEntry): Promise<SpecSummary> {
    if (entry.type === "protobuf" || entry.type === "graphql") {
        return {
            type: entry.type,
            title: undefined,
            version: undefined,
            endpointCount: 0,
            schemaCount: 0,
            specPath: entry.specPath
        };
    }

    try {
        const content = await readFile(entry.specPath, "utf-8");
        const spec = JSON.parse(content);
        return analyzeOpenAPILike(spec, entry);
    } catch {
        return {
            type: entry.type,
            title: undefined,
            version: undefined,
            endpointCount: 0,
            schemaCount: 0,
            specPath: entry.specPath
        };
    }
}

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);

function analyzeOpenAPILike(spec: Record<string, unknown>, entry: RawSpecsManifestEntry): SpecSummary {
    const info = spec.info as Record<string, unknown> | undefined;
    const title = typeof info?.title === "string" ? info.title : undefined;
    const version = typeof info?.version === "string" ? info.version : undefined;

    let endpointCount = 0;
    const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
    if (paths != null) {
        for (const pathItem of Object.values(paths)) {
            if (pathItem != null && typeof pathItem === "object") {
                for (const key of Object.keys(pathItem)) {
                    if (HTTP_METHODS.has(key.toLowerCase())) {
                        endpointCount++;
                    }
                }
            }
        }
    }

    let schemaCount = 0;
    const components = spec.components as Record<string, unknown> | undefined;
    const schemas = components?.schemas as Record<string, unknown> | undefined;
    if (schemas != null) {
        schemaCount = Object.keys(schemas).length;
    }

    // AsyncAPI channels
    if (entry.type === "asyncapi") {
        const channels = spec.channels as Record<string, unknown> | undefined;
        if (channels != null) {
            endpointCount = Object.keys(channels).length;
        }
    }

    // OpenRPC methods
    if (entry.type === "openrpc") {
        const methods = spec.methods as unknown[] | undefined;
        if (Array.isArray(methods)) {
            endpointCount = methods.length;
        }
    }

    return { type: entry.type, title, version, endpointCount, schemaCount, specPath: entry.specPath };
}

export function formatSpecAnalysis(analysis: SpecAnalysis): string {
    const lines: string[] = [];
    lines.push("╔══════════════════════════════════════════════════════════╗");
    lines.push("║              Fern CLI Generator — Spec Analysis         ║");
    lines.push("╚══════════════════════════════════════════════════════════╝");
    lines.push("");
    lines.push(`  Total specs:     ${analysis.totalSpecs}`);
    lines.push(`  Total endpoints: ${analysis.totalEndpoints}`);
    lines.push(`  Total schemas:   ${analysis.totalSchemas}`);
    lines.push("");

    for (const [i, spec] of analysis.specs.entries()) {
        lines.push(`  ── Spec ${i + 1} ──────────────────────────────────────────`);
        lines.push(`  Type:      ${spec.type}`);
        if (spec.title != null) {
            lines.push(`  Title:     ${spec.title}`);
        }
        if (spec.version != null) {
            lines.push(`  Version:   ${spec.version}`);
        }
        lines.push(`  Endpoints: ${spec.endpointCount}`);
        lines.push(`  Schemas:   ${spec.schemaCount}`);
        lines.push(`  Path:      ${spec.specPath}`);
        lines.push("");
    }

    return lines.join("\n");
}
