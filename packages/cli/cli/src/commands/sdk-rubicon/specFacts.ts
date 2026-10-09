import { access } from "node:fs/promises";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import type { TaskContext } from "@fern-api/task-context";

import type { RubiconDiagnostic, SpecFacts } from "./types.js";

type Json = Record<string, unknown>;

/**
 * Loads a spec the way `fern generate` does (overrides, overlay and refs to other files applied by
 * Fern's own loader), then extracts the facts the mapper needs.
 */
export async function loadSpecFacts({
    context,
    specPath,
    overridePaths,
    overlayPath,
    diagnosticPath
}: {
    context: TaskContext;
    specPath: string;
    overridePaths: string[];
    overlayPath: string | undefined;
    diagnosticPath: string;
}): Promise<{ facts: SpecFacts | undefined; diagnostics: RubiconDiagnostic[] }> {
    const error = (code: string, message: string, action: string) => ({
        facts: undefined,
        diagnostics: [{ severity: "error" as const, path: diagnosticPath, code, message, action }]
    });
    for (const path of [specPath, ...overridePaths, ...(overlayPath != null ? [overlayPath] : [])]) {
        if (!(await exists(path))) {
            return error("RUBICON_SPEC_MISSING", `File not found: ${path}`, "Fix the path in sdk-config.yml.");
        }
    }

    let document: unknown;
    try {
        document = await loadOpenAPI({
            context,
            absolutePathToOpenAPI: AbsoluteFilePath.of(specPath),
            absolutePathToOpenAPIOverrides:
                overridePaths.length > 0 ? overridePaths.map(AbsoluteFilePath.of) : undefined,
            absolutePathToOpenAPIOverlays: overlayPath != null ? AbsoluteFilePath.of(overlayPath) : undefined
        });
    } catch (cause) {
        return error(
            "RUBICON_SPEC_PARSE",
            `Could not load ${specPath}: ${cause instanceof Error ? cause.message : String(cause)}`,
            "Fix the spec so `fern check` accepts it."
        );
    }
    if (!isObject(document)) {
        return error("RUBICON_SPEC_PARSE", `${specPath} is not an OpenAPI document.`, "Fix the spec.");
    }

    // Fern's loader falls back to the unbundled document when bundling fails, so a ref to another
    // file can survive loading.
    const leftover = [...externalRefs(document)];
    if (leftover.length > 0) {
        return error(
            "RUBICON_EXTERNAL_REF",
            `${specPath} still references another file after loading: ${leftover.join(", ")}`,
            "Fix the reference so the file it points to exists."
        );
    }
    return { facts: extractSpecFacts(document), diagnostics: [] };
}

/** Reads security schemes, declared headers, POST operation properties and server URLs. Pure. */
export function extractSpecFacts(spec: Json): SpecFacts {
    const resolver = new RefResolver(spec);
    const securitySchemes = collectSecuritySchemes(spec, resolver);
    const headerApiKeys = Object.entries(securitySchemes).filter(
        ([, scheme]) => scheme.type === "apiKey" && scheme.in === "header"
    );
    return {
        securitySchemes,
        declaredHeaders: collectDeclaredHeaders(
            spec,
            resolver,
            headerApiKeys.map(([, scheme]) => scheme.name)
        ),
        schemeKeys: [...new Set(headerApiKeys.map(([key]) => key.toLowerCase()))].sort(),
        postOperations: collectPostOperations(spec, resolver),
        serverUrls: collectServerUrls(spec)
    };
}

function externalRefs(value: unknown, found = new Set<string>()): Set<string> {
    if (Array.isArray(value)) {
        value.forEach((item) => externalRefs(item, found));
    } else if (isObject(value)) {
        for (const [key, child] of Object.entries(value)) {
            if (key === "$ref" && typeof child === "string" && !child.startsWith("#")) {
                found.add(child);
            } else {
                externalRefs(child, found);
            }
        }
    }
    return found;
}

class RefResolver {
    constructor(private readonly root: Json) {}

    /** Follows local `$ref`s until a non-ref value, or undefined on a cycle or a missing target. */
    resolve(value: unknown): unknown {
        const seen = new Set<string>();
        let current = value;
        while (isObject(current) && typeof current.$ref === "string") {
            if (seen.has(current.$ref)) {
                return undefined;
            }
            seen.add(current.$ref);
            current = this.pointer(current.$ref);
        }
        return current;
    }

    private pointer(ref: string): unknown {
        return ref
            .replace(/^#\/?/, "")
            .split("/")
            .filter(Boolean)
            .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"))
            .reduce<unknown>((node, segment) => (isObject(node) ? node[segment] : undefined), this.root);
    }
}

function collectSecuritySchemes(spec: Json, resolver: RefResolver): SpecFacts["securitySchemes"] {
    const components = isObject(spec.components) ? spec.components : {};
    const declared = {
        ...(isObject(spec.securityDefinitions) ? spec.securityDefinitions : {}),
        ...(isObject(components.securitySchemes) ? components.securitySchemes : {})
    };
    const schemes: SpecFacts["securitySchemes"] = {};
    for (const [id, raw] of Object.entries(declared)) {
        const scheme = resolver.resolve(raw);
        if (!isObject(scheme)) {
            continue;
        }
        schemes[id] = removeUndefined({
            type: stringOrUndefined(scheme.type),
            in: stringOrUndefined(scheme.in),
            name: stringOrUndefined(scheme.name),
            scheme: stringOrUndefined(scheme.scheme)
        });
    }
    return schemes;
}

function collectDeclaredHeaders(spec: Json, resolver: RefResolver, apiKeyHeaders: unknown[]): string[] {
    const names = [
        ...operationHeaders(spec, resolver),
        ...arrayOf(spec["x-fern-global-headers"]).map((global) => global.header),
        // Fern's global parameters send `target` on the wire when it is set.
        ...arrayOf(spec["x-fern-global-parameters"])
            .filter((global) => global.in === "header")
            .map((global) => global.target ?? global.name),
        ...apiKeyHeaders
    ];
    const headers = names.filter((name): name is string => typeof name === "string").map((name) => name.toLowerCase());
    return [...new Set(headers)].sort();
}

function operationHeaders(spec: Json, resolver: RefResolver): unknown[] {
    const parameterLists: unknown[] = [];
    for (const pathItem of Object.values(isObject(spec.paths) ? spec.paths : {})) {
        const item = resolver.resolve(pathItem);
        if (!isObject(item)) {
            continue;
        }
        parameterLists.push(item.parameters);
        for (const operation of Object.values(item)) {
            if (isObject(operation)) {
                parameterLists.push(resolver.resolve(operation.parameters));
            }
        }
    }
    return parameterLists
        .flatMap((parameters) => (Array.isArray(parameters) ? parameters : []))
        .map((raw) => resolver.resolve(raw))
        .filter((parameter): parameter is Json => isObject(parameter) && parameter.in === "header")
        .map((parameter) => parameter.name);
}

function collectPostOperations(spec: Json, resolver: RefResolver): SpecFacts["postOperations"] {
    const operations: SpecFacts["postOperations"] = {};
    for (const [path, pathItem] of Object.entries(isObject(spec.paths) ? spec.paths : {})) {
        const item = resolver.resolve(pathItem);
        const post = isObject(item) ? resolver.resolve(item.post) : undefined;
        if (!isObject(post)) {
            continue;
        }
        operations[path] = {
            requestProperties: requestProperties(post, resolver),
            responseProperties: responseProperties(post, resolver)
        };
    }
    return operations;
}

function requestProperties(operation: Json, resolver: RefResolver): string[] {
    const body = resolver.resolve(operation.requestBody);
    if (isObject(body)) {
        return contentProperties(body.content, resolver);
    }
    // Swagger 2.0: body and formData parameters.
    const names = new Set<string>();
    for (const raw of Array.isArray(operation.parameters) ? operation.parameters : []) {
        const parameter = resolver.resolve(raw);
        if (!isObject(parameter)) {
            continue;
        }
        if (parameter.in === "formData" && typeof parameter.name === "string") {
            names.add(parameter.name);
        }
        if (parameter.in === "body") {
            schemaProperties(parameter.schema, resolver).forEach((name) => names.add(name));
        }
    }
    return [...names].sort();
}

function responseProperties(operation: Json, resolver: RefResolver): string[] {
    const responses = isObject(operation.responses) ? operation.responses : {};
    const names = new Set<string>();
    for (const [status, raw] of Object.entries(responses)) {
        if (!/^2/.test(status)) {
            continue;
        }
        const response = resolver.resolve(raw);
        if (!isObject(response)) {
            continue;
        }
        contentProperties(response.content, resolver).forEach((name) => names.add(name));
        schemaProperties(response.schema, resolver).forEach((name) => names.add(name));
    }
    return [...names].sort();
}

function contentProperties(content: unknown, resolver: RefResolver): string[] {
    const names = new Set<string>();
    for (const media of Object.values(isObject(content) ? content : {})) {
        if (isObject(media)) {
            schemaProperties(media.schema, resolver).forEach((name) => names.add(name));
        }
    }
    return [...names].sort();
}

function schemaProperties(raw: unknown, resolver: RefResolver, depth = 0): string[] {
    const schema = resolver.resolve(raw);
    if (!isObject(schema) || depth > 16) {
        return [];
    }
    const names = new Set(Object.keys(isObject(schema.properties) ? schema.properties : {}));
    for (const part of Array.isArray(schema.allOf) ? schema.allOf : []) {
        schemaProperties(part, resolver, depth + 1).forEach((name) => names.add(name));
    }
    return [...names].sort();
}

function collectServerUrls(spec: Json): string[] {
    if (Array.isArray(spec.servers)) {
        return spec.servers.flatMap((server) =>
            isObject(server) && typeof server.url === "string" ? [server.url] : []
        );
    }
    if (typeof spec.host === "string") {
        const scheme = Array.isArray(spec.schemes) && typeof spec.schemes[0] === "string" ? spec.schemes[0] : "https";
        return [`${scheme}://${spec.host}${typeof spec.basePath === "string" ? spec.basePath : ""}`];
    }
    return [];
}

function arrayOf(value: unknown): Json[] {
    return Array.isArray(value) ? value.filter(isObject) : [];
}

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

function stringOrUndefined(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function removeUndefined<T extends object>(value: T): T {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function isObject(value: unknown): value is Json {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
