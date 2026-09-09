import { readFile, writeFile } from "fs/promises";
import path from "path";

import { readSpecsManifest } from "./copySpecs.js";
import type { DetectedAuthBinding } from "./detectAuth.js";

/**
 * Emit `reference.md` — a full command reference for the generated CLI.
 *
 * Parses the mounted OpenAPI spec(s) to derive the same resource → method
 * command tree the Rust runtime builds, then renders a markdown file that
 * documents every subcommand, its HTTP mapping, and available flags.
 *
 * The command-tree derivation mirrors the Rust parser's logic:
 *   - Group = `x-fern-sdk-group-name` || (namespace, when the spec's
 *     `ignore-tags` is set) || first tag || first path segment
 *   - Method = `x-fern-sdk-method-name` || operationId (tag-prefix-stripped, or
 *     parent-noun-stripped with `stripParentNoun`; kebab-cased)
 *   - Parameters from path-level + operation-level `parameters` arrays
 */
export async function emitReference(args: {
    outputDir: string;
    binaryName: string;
    apiDisplayName: string | undefined;
    authBindings: DetectedAuthBinding[];
    specsDir?: string;
    stripParentNoun?: boolean;
}): Promise<void> {
    const { outputDir, binaryName, apiDisplayName, specsDir, stripParentNoun = false } = args;

    const manifest = await readSpecsManifest(specsDir);
    if (manifest == null) {
        return;
    }

    const openapiSpecs = manifest.specs.filter((entry) => entry.type === "openapi");
    if (openapiSpecs.length === 0) {
        return;
    }

    // Parse all OpenAPI specs and merge into a unified resource tree.
    const resources: Map<string, ResourceEntry> = new Map();

    for (const spec of openapiSpecs) {
        const raw = await readFile(spec.specPath, "utf-8");
        const doc = JSON.parse(raw) as OpenApiDocument;
        collectResources(doc, resources, {
            namespace: spec.namespace,
            ignoreTags: spec.apiImportSettings?.ignoreTags === true,
            stripParentNoun
        });
    }

    const displayName = apiDisplayName ?? binaryName;
    const content = renderReference({ binaryName, displayName, resources });
    await writeFile(path.join(outputDir, "reference.md"), content);
}

// ---------------------------------------------------------------------------
// OpenAPI types (minimal, only what we need for reference generation)
// ---------------------------------------------------------------------------

interface OpenApiDocument {
    info?: { title?: string; version?: string };
    paths?: Record<string, Record<string, OpenApiOperation>>;
    components?: { schemas?: Record<string, unknown>; parameters?: Record<string, OpenApiParameter> };
}

interface OpenApiOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: (OpenApiParameter | { $ref: string })[];
    requestBody?: OpenApiRequestBody;
    "x-fern-sdk-group-name"?: string | string[];
    "x-fern-sdk-method-name"?: string;
    "x-fern-availability"?: string;
    "x-fern-ignore"?: boolean;
    deprecated?: boolean;
}

interface OpenApiParameter {
    name: string;
    in: "query" | "path" | "header" | "cookie";
    required?: boolean;
    description?: string;
    schema?: OpenApiSchema;
    "x-fern-ignore"?: boolean;
}

interface OpenApiRequestBody {
    required?: boolean;
    content?: Record<string, { schema?: OpenApiSchema }>;
}

interface OpenApiSchema {
    type?: string;
    format?: string;
    items?: OpenApiSchema;
    $ref?: string;
    enum?: string[];
    properties?: Record<string, OpenApiSchema>;
    required?: string[];
    description?: string;
}

// ---------------------------------------------------------------------------
// Internal resource/method tree
// ---------------------------------------------------------------------------

interface ResourceEntry {
    methods: Map<string, MethodEntry>;
}

interface MethodEntry {
    description: string | undefined;
    httpMethod: string;
    path: string;
    parameters: ParameterEntry[];
    hasRequestBody: boolean;
    requestBodyRequired: boolean;
    availability: string | undefined;
}

interface ParameterEntry {
    name: string;
    location: "query" | "path" | "header";
    type: string;
    required: boolean;
    description: string | undefined;
}

// ---------------------------------------------------------------------------
// OpenAPI → resource tree extraction
// ---------------------------------------------------------------------------

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"] as const;

interface NamingOptions {
    namespace: string | undefined;
    ignoreTags: boolean;
    stripParentNoun: boolean;
}

function collectResources(doc: OpenApiDocument, resources: Map<string, ResourceEntry>, naming: NamingOptions): void {
    const paths = doc.paths ?? {};
    const componentParams = doc.components?.parameters ?? {};

    // Mirrors the runtime: with stripParentNoun, a stripped leaf claimed by
    // more than one operation in the same group falls back to the unstripped
    // name so no command is overwritten.
    const strippedLeafCounts = new Map<string, number>();
    if (naming.stripParentNoun) {
        for (const [pathStr, pathItem] of Object.entries(paths)) {
            for (const method of HTTP_METHODS) {
                const operation = pathItem[method] as OpenApiOperation | undefined;
                if (operation == null || operation["x-fern-ignore"] === true) {
                    continue;
                }
                const key = `${resolveGroupName(operation, pathStr, naming)} ${resolveMethodName(operation, method, pathStr, naming)}`;
                strippedLeafCounts.set(key, (strippedLeafCounts.get(key) ?? 0) + 1);
            }
        }
    }
    const unstrippedNaming: NamingOptions = { ...naming, stripParentNoun: false };

    for (const [pathStr, pathItem] of Object.entries(paths)) {
        // Collect path-level parameters (inherited by all operations)
        const pathParams: OpenApiParameter[] = resolveParamRefs(
            ((pathItem as Record<string, unknown>).parameters as (OpenApiParameter | { $ref: string })[] | undefined) ??
                [],
            componentParams
        );

        for (const method of HTTP_METHODS) {
            const operation = pathItem[method] as OpenApiOperation | undefined;
            if (operation == null) {
                continue;
            }
            if (operation["x-fern-ignore"] === true) {
                continue;
            }

            const groupName = resolveGroupName(operation, pathStr, naming);
            let methodName = resolveMethodName(operation, method, pathStr, naming);
            if (naming.stripParentNoun && (strippedLeafCounts.get(`${groupName} ${methodName}`) ?? 0) > 1) {
                methodName = resolveMethodName(operation, method, pathStr, unstrippedNaming);
            }
            const availability = resolveAvailability(operation);

            // Merge path-level + operation-level params (operation wins on conflict).
            const params = mergeParameters(pathParams, resolveParamRefs(operation.parameters ?? [], componentParams));
            const paramEntries = params
                .filter((p) => p["x-fern-ignore"] !== true && p.in !== "cookie")
                .map((p) => ({
                    name: p.name,
                    location: p.in as "query" | "path" | "header",
                    type: schemaToTypeString(p.schema),
                    required: p.required === true,
                    description: p.description
                }));

            const hasBody = operation.requestBody != null;
            const bodyRequired = operation.requestBody?.required === true;

            if (!resources.has(groupName)) {
                resources.set(groupName, { methods: new Map() });
            }
            // Safe: we just ensured the key exists above.
            const resource = resources.get(groupName) ?? { methods: new Map() };
            resource.methods.set(methodName, {
                description: operation.description ?? operation.summary,
                httpMethod: method.toUpperCase(),
                path: pathStr,
                parameters: paramEntries,
                hasRequestBody: hasBody,
                requestBodyRequired: bodyRequired,
                availability
            });
        }
    }
}

/**
 * Convert camelCase/PascalCase/mixed strings to kebab-case, splitting
 * on word boundaries. Mirrors the Rust parser's `camel_to_kebab`.
 *
 *   "createMovie"   → "create-movie"
 *   "ACMEPublic"    → "acme-public"
 *   "getHTTPSUrl"   → "get-https-url"
 *   "Customers"     → "customers"
 *   "foo bar"       → "foo-bar"
 */
function camelToKebab(input: string): string {
    return input
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

/**
 * True when the operation's group collapses into the spec namespace: no
 * explicit `x-fern-sdk-group-name`, and the spec is mounted under a namespace
 * with `ignore-tags` set. Mirrors the Rust runtime's `flatten_into`.
 */
function isFlattened(op: OpenApiOperation, naming: NamingOptions): boolean {
    return op["x-fern-sdk-group-name"] == null && naming.ignoreTags && naming.namespace != null;
}

function resolveGroupName(op: OpenApiOperation, pathStr: string, naming: NamingOptions): string {
    const { namespace } = naming;
    const fernGroup = op["x-fern-sdk-group-name"];
    let groupParts: string[];

    if (fernGroup != null) {
        groupParts = Array.isArray(fernGroup) ? fernGroup : [fernGroup];
    } else if (isFlattened(op, naming) && namespace != null) {
        return camelToKebab(namespace);
    } else if (op.tags != null && op.tags.length > 0 && op.tags[0] != null) {
        groupParts = [op.tags[0]];
    } else {
        const segment = pathStr.replace(/^\//, "").split("/")[0] ?? "default";
        groupParts = [segment];
    }

    const kebab = groupParts.map((p) => camelToKebab(p)).join(" ");
    if (namespace != null) {
        return `${camelToKebab(namespace)} ${kebab}`;
    }
    return kebab;
}

function resolveMethodName(op: OpenApiOperation, httpMethod: string, pathStr: string, naming: NamingOptions): string {
    if (op["x-fern-sdk-method-name"] != null) {
        return camelToKebab(op["x-fern-sdk-method-name"]);
    }
    if (op.operationId != null) {
        const flattened = isFlattened(op, naming);
        // The parent whose tokens may be removed from the operationId: the
        // namespace when tags are ignored, the first tag otherwise, nothing
        // when the group is explicit.
        const parent =
            op["x-fern-sdk-group-name"] != null
                ? undefined
                : flattened
                  ? naming.namespace
                  : op.tags != null && op.tags.length > 0
                    ? op.tags[0]
                    : undefined;
        if (parent != null && naming.stripParentNoun) {
            return camelToKebab(stripParentNoun(op.operationId, parent));
        }
        if (parent != null && !flattened) {
            return camelToKebab(stripTagPrefix(op.operationId, parent));
        }
        return camelToKebab(op.operationId);
    }
    // Fallback: http-method-path
    return `${httpMethod}-${pathStr.replace(/^\//, "").replace(/\//g, "-")}`;
}

/**
 * Mirror Fern's behavior: strip tag tokens that prefix the operationId.
 * `tag="Customers", operationId="customersList"` → `list`.
 */
function stripTagPrefix(operationId: string, tag: string): string {
    const tagTokens = tokenize(tag);
    const opTokens = tokenize(operationId);

    if (tagTokens.length === 0 || opTokens.length <= tagTokens.length) {
        return operationId;
    }

    for (let i = 0; i < tagTokens.length; i++) {
        if (opTokens[i] !== tagTokens[i]) {
            return operationId;
        }
    }

    return opTokens.slice(tagTokens.length).join("-");
}

/**
 * Remove every token of `parent` from anywhere in the operationId,
 * singular/plural-insensitive. Keeps the original when nothing would be
 * left. Mirrors the Rust runtime's `strip_parent_noun`.
 * `parent="Messages", operationId="CreateMessage"` → `create`.
 */
function stripParentNoun(operationId: string, parent: string): string {
    const parentKeys = new Set(tokenize(parent).map(singularKey));
    if (parentKeys.size === 0) {
        return operationId;
    }
    const opTokens = tokenize(operationId);
    const opKeys = new Set(opTokens.map(singularKey));
    if (![...parentKeys].every((k) => opKeys.has(k))) {
        return operationId;
    }
    const kept = opTokens.filter((t) => !parentKeys.has(singularKey(t)));
    return kept.length === 0 ? operationId : kept.join("-");
}

/** Crude singular used only for equality; mirrors the Rust `singular_key`. */
function singularKey(token: string): string {
    if (token.endsWith("ies")) {
        return `${token.slice(0, -3)}y`;
    }
    if (token.endsWith("ss") || token.length <= 1) {
        return token;
    }
    return token.endsWith("s") ? token.slice(0, -1) : token;
}

/**
 * Split a string into lowercase tokens on word boundaries (matching the
 * Rust parser's tokenize logic).
 */
function tokenize(input: string): string[] {
    return input
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 0);
}

function resolveAvailability(op: OpenApiOperation): string | undefined {
    const fern = op["x-fern-availability"];
    if (fern != null) {
        return fern;
    }
    if (op.deprecated === true) {
        return "deprecated";
    }
    return undefined;
}

/**
 * Type guard: returns true when `p` is a JSON `$ref` pointer rather than
 * an inline parameter object.
 */
function isRefEntry(p: OpenApiParameter | { $ref: string }): p is { $ref: string } {
    return "$ref" in p && typeof (p as Record<string, unknown>).$ref === "string";
}

/**
 * Resolve `$ref` entries in a parameters array by looking them up in
 * `components.parameters`. Entries that are already inline are passed
 * through; `$ref` entries whose target cannot be found are skipped.
 */
function resolveParamRefs(
    params: (OpenApiParameter | { $ref: string })[],
    componentParams: Record<string, OpenApiParameter>
): OpenApiParameter[] {
    const resolved: OpenApiParameter[] = [];
    for (const p of params) {
        if (isRefEntry(p)) {
            // Expected format: "#/components/parameters/<name>"
            const refName = p.$ref.split("/").pop();
            if (refName != null && componentParams[refName] != null) {
                resolved.push(componentParams[refName]);
            }
            // Skip unresolvable $ref entries rather than crashing.
        } else if (p.name != null) {
            resolved.push(p);
        }
    }
    return resolved;
}

function mergeParameters(pathLevel: OpenApiParameter[], opLevel: OpenApiParameter[]): OpenApiParameter[] {
    const merged = new Map<string, OpenApiParameter>();
    for (const p of pathLevel) {
        merged.set(`${p.in}:${p.name}`, p);
    }
    // Operation-level wins on conflict
    for (const p of opLevel) {
        merged.set(`${p.in}:${p.name}`, p);
    }
    return [...merged.values()];
}

function schemaToTypeString(schema: OpenApiSchema | undefined): string {
    if (schema == null) {
        return "string";
    }
    if (schema.$ref != null) {
        const refName = schema.$ref.split("/").pop() ?? "object";
        return refName;
    }
    if (schema.enum != null) {
        return schema.enum.join(" | ");
    }
    if (schema.type === "array") {
        const itemType = schemaToTypeString(schema.items);
        return `${itemType}[]`;
    }
    if (schema.format != null) {
        return `${schema.type} (${schema.format})`;
    }
    return schema.type ?? "string";
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function renderReference(args: {
    binaryName: string;
    displayName: string;
    resources: Map<string, ResourceEntry>;
}): string {
    const { binaryName, displayName, resources } = args;
    const lines: string[] = [];

    lines.push(`# ${displayName} CLI Reference`);
    lines.push("");
    lines.push(`Full command reference for \`${binaryName}\`.`);
    lines.push("");

    // Table of contents
    if (resources.size > 0) {
        lines.push("## Commands");
        lines.push("");

        const sortedResources = [...resources.entries()].sort((a, b) => a[0].localeCompare(b[0]));

        // TOC
        for (const [resourceName] of sortedResources) {
            const anchor = `${binaryName} ${resourceName}`.replace(/\s+/g, "-").toLowerCase();
            lines.push(`- [\`${binaryName} ${resourceName}\`](#${anchor})`);
        }
        lines.push("");

        // Per-resource sections
        for (const [resourceName, resource] of sortedResources) {
            lines.push(`---`);
            lines.push("");
            lines.push(`### \`${binaryName} ${resourceName}\``);
            lines.push("");

            const sortedMethods = [...resource.methods.entries()].sort((a, b) => a[0].localeCompare(b[0]));

            for (const [methodName, method] of sortedMethods) {
                renderMethod({ lines, binaryName, resourceName, methodName, method });
            }
        }
    }

    // Global flags section
    lines.push("---");
    lines.push("");
    lines.push("## Global flags");
    lines.push("");
    lines.push("These flags are available on every command:");
    lines.push("");
    lines.push("| Flag | Description |");
    lines.push("|------|-------------|");
    lines.push("| `--dry-run` | Print the HTTP request without sending it |");
    lines.push("| `--json <JSON\\|->` | Supply the request body as JSON (or `-` for stdin) |");
    lines.push("| `--params <JSON>` | Merge extra parameters as JSON |");
    lines.push("| `--format <json\\|table\\|yaml\\|csv>` | Output format (default: `json`) |");
    lines.push("| `--output <PATH>` | Write binary responses to a file |");
    lines.push("| `--base-url <URL>` | Override the API base URL |");
    lines.push("| `--no-extract` | Print the full response body instead of the `x-fern-sdk-return-value` extraction |");
    lines.push("| `--no-retry` | Disable retries declared by `x-fern-retries`, including network errors |");
    lines.push("| `-q, --quiet` | Suppress stdout on success |");
    lines.push("| `-h, --help` | Print help |");
    lines.push("| `-V, --version` | Print version |");
    lines.push("");
    lines.push(
        "Operations the spec describes how to page (via `x-fern-pagination` or a root `page_token` parameter) also accept:"
    );
    lines.push("");
    lines.push("| Flag | Description |");
    lines.push("|------|-------------|");
    lines.push("| `--page-all` | Auto-paginate and stream all results |");
    lines.push("| `--page-limit <N>` | Max pages to fetch (default: `10`) |");
    lines.push("| `--page-delay <MS>` | Delay between page fetches in milliseconds (default: `100`) |");
    lines.push("| `--no-pager` | Disable the pager even on interactive terminals |");
    lines.push("");
    lines.push("Operations the spec marks as streaming (via `x-fern-streaming`) also accept:");
    lines.push("");
    lines.push("| Flag | Description |");
    lines.push("|------|-------------|");
    lines.push("| `--no-stream` | Buffer the streaming response and print it as a single value once complete |");

    return lines.join("\n") + "\n";
}

function renderMethod(args: {
    lines: string[];
    binaryName: string;
    resourceName: string;
    methodName: string;
    method: MethodEntry;
}): void {
    const { lines, binaryName, resourceName, methodName, method } = args;

    const badge = availabilityBadge(method.availability);
    lines.push(`#### \`${binaryName} ${resourceName} ${methodName}\`${badge}`);
    lines.push("");

    if (method.description != null) {
        lines.push(method.description);
        lines.push("");
    }

    lines.push(`\`${method.httpMethod} ${method.path}\``);
    lines.push("");

    // Parameters table
    const allParams = [...method.parameters];
    if (method.hasRequestBody) {
        allParams.push({
            name: "--json",
            location: "query",
            type: "JSON",
            required: method.requestBodyRequired,
            description: "Request body as JSON (or use individual body-field flags)"
        });
    }

    if (allParams.length > 0) {
        lines.push("| Flag | Type | Required | Description |");
        lines.push("|------|------|----------|-------------|");

        for (const param of allParams) {
            const flagName = param.name.startsWith("--") ? param.name : `--${toFlagName(param.name)}`;
            const required = param.required ? "Yes" : "No";
            const desc = (param.description ?? "").replace(/\|/g, "\\|");
            lines.push(`| \`${flagName}\` | \`${param.type}\` | ${required} | ${desc} |`);
        }
        lines.push("");
    }
}

function toFlagName(name: string): string {
    // Convert param name to CLI flag style: camelCase → kebab-case
    return name
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function availabilityBadge(availability: string | undefined): string {
    if (availability == null || availability === "generally-available" || availability === "ga") {
        return "";
    }
    const label = availability.replace(/-/g, " ").toUpperCase();
    return ` \`[${label}]\``;
}
