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
 *   - Group = `x-fern-sdk-group-name` || first tag || first path segment
 *   - Method = `x-fern-sdk-method-name` || operationId (tag-prefix-stripped, kebab-cased)
 *   - Namespaces split on `/` into nested commands; a group named like the
 *     namespace is hoisted into it (`ns ns list` → `ns list`)
 *   - Only GET/POST/PUT/PATCH/DELETE become commands
 *   - Parameters from path-level + operation-level `parameters` arrays, plus
 *     one flag per request-body field (dot-notation for nested fields)
 */
export async function emitReference(args: {
    outputDir: string;
    binaryName: string;
    apiDisplayName: string | undefined;
    authBindings: DetectedAuthBinding[];
    specsDir?: string;
}): Promise<void> {
    const { outputDir, binaryName, apiDisplayName, specsDir } = args;

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
        collectResources(doc, resources, spec.namespace);
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
    components?: {
        schemas?: Record<string, OpenApiSchema>;
        parameters?: Record<string, OpenApiParameter>;
        requestBodies?: Record<string, OpenApiRequestBody>;
    };
}

interface OpenApiOperation {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: (OpenApiParameter | { $ref: string })[];
    requestBody?: OpenApiRequestBody | { $ref: string };
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
    "x-fern-parameter-name"?: string;
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
    allOf?: OpenApiSchema[];
    readOnly?: boolean;
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
    location: "query" | "path" | "header" | "body";
    type: string;
    required: boolean;
    description: string | undefined;
}

// ---------------------------------------------------------------------------
// OpenAPI → resource tree extraction
// ---------------------------------------------------------------------------

// The runtime builds commands for these methods only; HEAD/OPTIONS (e.g.
// CORS preflight) operations have no command.
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

function collectResources(
    doc: OpenApiDocument,
    resources: Map<string, ResourceEntry>,
    namespace: string | undefined
): void {
    const paths = doc.paths ?? {};
    const componentParams = doc.components?.parameters ?? {};

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

            const groupName = resolveGroupName(operation, pathStr, namespace);
            const methodName = resolveMethodName(operation, method, pathStr);
            const availability = resolveAvailability(operation);

            // Merge path-level + operation-level params (operation wins on conflict).
            const params = mergeParameters(pathParams, resolveParamRefs(operation.parameters ?? [], componentParams));
            const paramEntries = params
                .filter((p) => p["x-fern-ignore"] !== true && p.in !== "cookie")
                .map((p) => ({
                    name: `--${reserveFlagName(sanitizeFlagName(p["x-fern-parameter-name"] ?? p.name))}`,
                    location: p.in as "query" | "path" | "header",
                    type: schemaToTypeString(p.schema),
                    required: p.required === true,
                    description: p.description
                }));

            const requestBody = resolveRequestBody(operation.requestBody, doc.components?.requestBodies ?? {});
            const hasBody = requestBody != null;
            const bodyRequired = requestBody?.required === true;
            paramEntries.push(...bodyFieldParameters(requestBody, doc.components?.schemas ?? {}));

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

function resolveGroupName(op: OpenApiOperation, pathStr: string, namespace: string | undefined): string {
    const fernGroup = op["x-fern-sdk-group-name"];
    let groupParts: string[];

    if (fernGroup != null) {
        groupParts = Array.isArray(fernGroup) ? fernGroup : [fernGroup];
    } else if (op.tags != null && op.tags.length > 0 && op.tags[0] != null) {
        groupParts = [op.tags[0]];
    } else {
        const segment = pathStr.replace(/^\//, "").split("/")[0] ?? "default";
        groupParts = [segment];
    }

    const kebabParts = groupParts.map((p) => camelToKebab(p));
    // Mirrors the runtime's `spec_under`: `/` nests, segments are used as-is,
    // and a top-level group named like the innermost namespace is hoisted
    // into it rather than repeated.
    const namespaceParts = (namespace ?? "").split("/").filter((segment) => segment.length > 0);
    if (namespaceParts.length > 0 && kebabParts[0] === namespaceParts[namespaceParts.length - 1]) {
        kebabParts.shift();
    }
    return [...namespaceParts, ...kebabParts].join(" ");
}

function resolveMethodName(op: OpenApiOperation, httpMethod: string, pathStr: string): string {
    if (op["x-fern-sdk-method-name"] != null) {
        return camelToKebab(op["x-fern-sdk-method-name"]);
    }
    if (op.operationId != null) {
        const fernGroup = op["x-fern-sdk-group-name"];
        // When group comes from tag (no x-fern-sdk-group-name), strip tag prefix
        if (fernGroup == null && op.tags != null && op.tags.length > 0 && op.tags[0] != null) {
            const stripped = stripTagPrefix(op.operationId, op.tags[0]);
            return camelToKebab(stripped);
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

function resolveRequestBody(
    body: OpenApiRequestBody | { $ref: string } | undefined,
    componentBodies: Record<string, OpenApiRequestBody>
): OpenApiRequestBody | undefined {
    if (body == null) {
        return undefined;
    }
    if ("$ref" in body && typeof body.$ref === "string") {
        const name = body.$ref.split("/").pop();
        return name != null ? componentBodies[name] : undefined;
    }
    return body as OpenApiRequestBody;
}

/** Same nesting limit as the runtime's `MAX_BODY_DEPTH`. */
const MAX_BODY_DEPTH = 3;

/**
 * One flag per request-body field, as the runtime registers them: the
 * `application/json` (else `application/x-www-form-urlencoded`, else
 * `multipart/form-data`) schema's properties, `allOf` branches merged,
 * `readOnly` fields skipped, nested object fields as `--parent.child` plus a
 * `--parent` JSON shorthand.
 */
function bodyFieldParameters(
    body: OpenApiRequestBody | undefined,
    componentSchemas: Record<string, OpenApiSchema>
): ParameterEntry[] {
    const content = body?.content;
    if (content == null) {
        return [];
    }
    const media =
        content["application/json"] ?? content["application/x-www-form-urlencoded"] ?? content["multipart/form-data"];
    const schema = resolveSchemaRef(media?.schema, componentSchemas);
    if (schema == null) {
        return [];
    }
    return flattenBodySchema(schema, componentSchemas, 0, "");
}

function resolveSchemaRef(
    schema: OpenApiSchema | undefined,
    componentSchemas: Record<string, OpenApiSchema>,
    seen: Set<string> = new Set()
): OpenApiSchema | undefined {
    if (schema?.$ref == null) {
        return schema;
    }
    const name = schema.$ref.split("/").pop();
    if (name == null || seen.has(name)) {
        return undefined;
    }
    seen.add(name);
    return resolveSchemaRef(componentSchemas[name], componentSchemas, seen);
}

function isObjectLike(schema: OpenApiSchema): boolean {
    return schema.type === "object" || (schema.allOf?.length ?? 0) > 0;
}

function mergedProperties(
    schema: OpenApiSchema,
    componentSchemas: Record<string, OpenApiSchema>
): { properties: Record<string, OpenApiSchema>; required: Set<string> } {
    const properties: Record<string, OpenApiSchema> = {};
    const required = new Set<string>();
    for (const branch of schema.allOf ?? []) {
        const resolved = resolveSchemaRef(branch, componentSchemas);
        if (resolved == null) {
            continue;
        }
        const nested = mergedProperties(resolved, componentSchemas);
        Object.assign(properties, nested.properties);
        nested.required.forEach((name) => required.add(name));
    }
    Object.assign(properties, schema.properties ?? {});
    (schema.required ?? []).forEach((name) => required.add(name));
    return { properties, required };
}

function flattenBodySchema(
    schema: OpenApiSchema,
    componentSchemas: Record<string, OpenApiSchema>,
    depth: number,
    prefix: string
): ParameterEntry[] {
    if (depth >= MAX_BODY_DEPTH || !isObjectLike(schema)) {
        return [];
    }
    const { properties, required } = mergedProperties(schema, componentSchemas);
    const out: ParameterEntry[] = [];
    for (const [name, prop] of Object.entries(properties)) {
        if (prop.readOnly === true) {
            continue;
        }
        const key = prefix.length > 0 ? `${prefix}.${name}` : name;
        const resolved = resolveSchemaRef(prop, componentSchemas) ?? prop;
        const description = prop.description ?? resolved.description;
        if (isObjectLike(resolved)) {
            const nested = flattenBodySchema(resolved, componentSchemas, depth + 1, key);
            if (nested.length > 0) {
                // The `--parent` JSON shorthand is optional: the dot-notation
                // leaves can satisfy the field instead.
                out.push({
                    name: `--${reserveFlagName(toKebabFlag(key))}`,
                    location: "body",
                    type: "JSON",
                    required: false,
                    description
                });
                out.push(...nested);
                continue;
            }
        }
        out.push({
            name: `--${reserveFlagName(toKebabFlag(key))}`,
            location: "body",
            type: schemaToTypeString(prop),
            required: required.has(name),
            description
        });
    }
    return out;
}

/**
 * Body-field flag spelling, ported from the runtime's `text::to_kebab_flag`:
 * `_`/`-` collapse to one `-`, each uppercase letter starts a new word, and
 * dots (nested fields) are kept. Differs from `camelToKebab` on acronyms
 * (`SID` → `s-i-d`), so the two are not interchangeable.
 */
function toKebabFlag(name: string): string {
    let result = "";
    for (const ch of name) {
        if (ch === "_" || ch === "-") {
            if (result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
        } else if (ch !== ch.toLowerCase()) {
            if (result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
            result += ch.toLowerCase();
        } else {
            result += ch;
        }
    }
    return result;
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
    lines.push("| `--retries <N>` | Retry a failed request up to N additional times |");
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
        lines.push(demoteMarkdownHeadings(method.description));
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
            // Individual body-field flags can satisfy a required body instead.
            required: method.requestBodyRequired && !method.parameters.some((p) => p.location === "body"),
            description: "Request body as JSON (or use individual body-field flags)"
        });
    }

    if (allParams.length > 0) {
        lines.push("| Flag | Type | Required | Description |");
        lines.push("|------|------|----------|-------------|");

        for (const param of allParams) {
            const flagName = param.name;
            const required = param.required ? "Yes" : "No";
            const desc = tableCell(param.description ?? "");
            lines.push(`| \`${flagName}\` | \`${param.type}\` | ${required} | ${desc} |`);
        }
        lines.push("");
    }
}

/**
 * Operation descriptions are embedded under `####` command headings, so a
 * `#`-heading inside one would break the document outline. Render them as
 * bold lines instead.
 */
function demoteMarkdownHeadings(text: string): string {
    return text.replace(/^ {0,3}#{1,6}[ \t]+(.+?)[ \t#]*$/gm, "**$1**");
}

/** A Markdown table cell: one line, `|` escaped, headings flattened. */
function tableCell(text: string): string {
    return text
        .replace(/^ {0,3}#{1,6}[ \t]+/gm, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\|/g, "\\|");
}

/**
 * Path/query/header flag spelling, ported from the runtime's
 * `text::sanitize_flag_name`: like {@link toKebabFlag}, but every
 * non-alphanumeric character separates words (`DateSent<` → `date-sent`).
 */
function sanitizeFlagName(name: string): string {
    const ascii = name.normalize("NFKD").replace(/[^\x20-\x7e]/g, "");
    let result = "";
    for (const ch of ascii) {
        if (/[A-Za-z0-9]/.test(ch)) {
            if (/[A-Z]/.test(ch) && result.length > 0 && !result.endsWith("-")) {
                result += "-";
            }
            result += ch.toLowerCase();
        } else if (result.length > 0 && !result.endsWith("-")) {
            result += "-";
        }
    }
    return result.replace(/-+$/, "");
}

/** The runtime's own flags; a spec parameter that collides gets `-param`. */
const RESERVED_FLAG_NAMES = new Set([
    "params",
    "output",
    "json",
    "format",
    "dry-run",
    "base-url",
    "page-all",
    "page-limit",
    "page-delay",
    "no-pager",
    "no-extract",
    "retries",
    "no-retry",
    "no-stream",
    "quiet",
    "query",
    "help",
    "debug",
    "schema",
    "user-agent-suffix"
]);

function reserveFlagName(flag: string): string {
    return RESERVED_FLAG_NAMES.has(flag) ? `${flag}-param` : flag;
}

function availabilityBadge(availability: string | undefined): string {
    if (availability == null || availability === "generally-available" || availability === "ga") {
        return "";
    }
    const label = availability.replace(/-/g, " ").toUpperCase();
    return ` \`[${label}]\``;
}
