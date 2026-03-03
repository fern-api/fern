import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { dirname, resolve } from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns `true` for HTTP/HTTPS URL refs that should be left for the
 *  downstream converter (`AbstractSpecConverter.resolveAllExternalRefs`)
 *  to handle via `fetch()`. */
function isUrlRef(ref: string): boolean {
    return ref.startsWith("http://") || ref.startsWith("https://");
}

/** Read and parse a YAML/JSON file, using `fileCache` to avoid redundant I/O
 *  within a single bundling pass. */
async function readAndParseFile(absolutePath: string, fileCache: Map<string, unknown>): Promise<unknown> {
    const cached = fileCache.get(absolutePath);
    if (cached !== undefined) {
        return cached;
    }
    const contents = await readFile(absolutePath, "utf-8");
    const parsed: unknown = yaml.load(contents);
    fileCache.set(absolutePath, parsed);
    return parsed;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Build a reverse-lookup map from (absolute-file-path + "#" + JSON-pointer)
 * to the internal `#/section/key` ref path for every top-level external $ref
 * entry in the document.
 *
 * For example, if the document has:
 *   channels:
 *     SpeakV1: { $ref: "./channels/speak.v1.yml#/SpeakV1" }
 *
 * then the registry will contain:
 *   "/abs/path/channels/speak.v1.yml#/SpeakV1" → "#/channels/SpeakV1"
 *
 * This lets us convert external cross-file refs (e.g. from an operations file
 * back to the channels file) into internal refs like `#/channels/SpeakV1`
 * instead of inlining them.
 */
export function buildExternalRefRegistry(doc: unknown, baseDir: string): Map<string, string> {
    const registry = new Map<string, string>();
    if (doc == null || typeof doc !== "object" || Array.isArray(doc)) {
        return registry;
    }
    const record = doc as Record<string, unknown>;

    function registerSection(section: unknown, internalPrefix: string): void {
        if (section == null || typeof section !== "object" || Array.isArray(section)) {
            return;
        }
        for (const [key, value] of Object.entries(section as Record<string, unknown>)) {
            if (!isExternalRefValue(value)) {
                continue;
            }
            const ref = (value as Record<string, unknown>)["$ref"] as string;
            const { jsonPointer, absolutePath } = parseExternalRef(ref, baseDir);
            registry.set(`${absolutePath}#${jsonPointer}`, `${internalPrefix}/${key}`);
        }
    }

    registerSection(record["channels"], "#/channels");
    registerSection(record["operations"], "#/operations");

    const components = record["components"];
    if (components != null && typeof components === "object" && !Array.isArray(components)) {
        const comp = components as Record<string, unknown>;
        registerSection(comp["schemas"], "#/components/schemas");
        registerSection(comp["messages"], "#/components/messages");
        registerSection(comp["parameters"], "#/components/parameters");
    }

    return registry;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ParsedRef {
    filePath: string;
    jsonPointer: string;
    absolutePath: string;
}

function parseExternalRef(ref: string, baseDir: string): ParsedRef {
    const hashIndex = ref.indexOf("#");
    const filePath = hashIndex >= 0 ? ref.slice(0, hashIndex) : ref;
    const jsonPointer = hashIndex >= 0 ? ref.slice(hashIndex + 1) : "";
    const absolutePath = resolve(baseDir, filePath);
    return { filePath, jsonPointer, absolutePath };
}

function isExternalRefValue(value: unknown): boolean {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const ref = (value as Record<string, unknown>)["$ref"];
    return typeof ref === "string" && ref.length > 0 && !ref.startsWith("#") && !isUrlRef(ref);
}

/**
 * Given a resolved absolute ref path + JSON pointer, check whether it should
 * become an internal `#/…` ref rather than be inlined:
 *
 * 1. Back-reference to the main document          → `#/jsonPointer`
 * 2. Exact match in the registry                   → registry value
 * 3. Prefix match in the registry (deeper pointer) → registry value + suffix
 *
 * Returns `null` if the ref should instead be inlined.
 */
function findInternalRef(
    absRefPath: string,
    jsonPointer: string,
    mainFileAbsPath: string,
    registry: Map<string, string>
): string | null {
    // Case 1: back-reference to the main document
    if (absRefPath === mainFileAbsPath) {
        return "#" + jsonPointer;
    }

    const fullKey = `${absRefPath}#${jsonPointer}`;

    // Case 2: exact match
    const exact = registry.get(fullKey);
    if (exact !== undefined) {
        return exact;
    }

    // Case 3: prefix match — the registry entry covers a parent object and the
    // ref navigates deeper into it (e.g. #/channels/SpeakV1/messages/SpeakV1Text)
    for (const [registryKey, internalRef] of registry) {
        const hashIdx = registryKey.indexOf("#");
        const regAbsPath = registryKey.slice(0, hashIdx);
        const regPointer = registryKey.slice(hashIdx + 1);

        if (regAbsPath === absRefPath && jsonPointer.startsWith(regPointer + "/")) {
            // suffix keeps its leading "/" so concatenation is correct
            const suffix = jsonPointer.slice(regPointer.length);
            return internalRef + suffix;
        }
    }

    return null;
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

/**
 * Recursively resolve external file `$ref` references in a parsed AsyncAPI (or
 * similar) document.
 *
 * **Behaviour**
 * - Internal refs (`#/…`) are always left unchanged.
 * - External refs (`./foo.yml#/Bar`) are handled based on `applyRegistry`:
 *   - When `false` (top-level processing of the main document): always inline.
 *   - When `true` (inside a loaded external file): first try to convert to an
 *     internal ref via the registry/main-file lookup; inline only if no match.
 * - Transitive external refs inside loaded files are resolved recursively with
 *   `applyRegistry = true`.
 *
 * @param obj             - Document fragment to process
 * @param baseDir         - Absolute directory for resolving relative file refs
 * @param mainFileAbsPath - Absolute path to the root document being bundled
 * @param registry        - Ref registry built by `buildExternalRefRegistry`
 * @param applyRegistry   - Whether to attempt registry-based ref conversion
 * @param visited         - Cycle-detection set (do not pass externally)
 * @param fileCache       - Per-call file cache (do not pass externally)
 */
export async function resolveExternalRefs(
    obj: unknown,
    baseDir: string,
    mainFileAbsPath: string,
    registry: Map<string, string>,
    applyRegistry = false,
    visited: Set<string> = new Set(),
    fileCache: Map<string, unknown> = new Map()
): Promise<unknown> {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        return Promise.all(
            obj.map((item) =>
                resolveExternalRefs(item, baseDir, mainFileAbsPath, registry, applyRegistry, visited, fileCache)
            )
        );
    }

    const record = obj as Record<string, unknown>;

    const ref = record["$ref"];
    if (typeof ref === "string" && !ref.startsWith("#") && !isUrlRef(ref)) {
        const { jsonPointer, absolutePath: absoluteRefPath } = parseExternalRef(ref, baseDir);

        // Collect sibling properties (keys other than $ref). AsyncAPI 3.x and
        // OpenAPI 3.1+ allow meaningful sibling keywords alongside $ref (e.g.
        // "description" overriding the referenced schema's description).
        const siblingProperties: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record)) {
            if (key !== "$ref") {
                siblingProperties[key] = value;
            }
        }
        const hasSiblings = Object.keys(siblingProperties).length > 0;

        // When inside a loaded file, prefer converting to an internal ref
        if (applyRegistry) {
            const internalRef = findInternalRef(absoluteRefPath, jsonPointer, mainFileAbsPath, registry);
            if (internalRef !== null) {
                return { $ref: internalRef, ...siblingProperties };
            }
        }

        // Inline the referenced content
        const cacheKey = `${absoluteRefPath}#${jsonPointer}`;
        if (visited.has(cacheKey)) {
            throw new Error(`Circular $ref detected: "${ref}" (resolved to "${cacheKey}")`);
        }
        const newVisited = new Set(visited);
        newVisited.add(cacheKey);

        let parsed: unknown = await readAndParseFile(absoluteRefPath, fileCache);

        if (jsonPointer !== "") {
            const keys = jsonPointer.split("/").filter((k) => k !== "");
            let current: unknown = parsed;
            for (const key of keys) {
                const decodedKey = key.replace(/~1/g, "/").replace(/~0/g, "~");
                if (typeof current !== "object" || current == null) {
                    throw new Error(
                        `Cannot navigate JSON Pointer "${jsonPointer}" in "${absoluteRefPath}": ` +
                            `expected an object but found ${typeof current} at key "${decodedKey}"`
                    );
                }
                const next = (current as Record<string, unknown>)[decodedKey];
                if (next === undefined) {
                    throw new Error(
                        `Cannot navigate JSON Pointer "${jsonPointer}" in "${absoluteRefPath}": ` +
                            `key "${decodedKey}" not found`
                    );
                }
                current = next;
            }
            parsed = current;
        }

        // Recursively resolve the loaded content, now with registry active
        const refDir = dirname(absoluteRefPath);
        const resolved = await resolveExternalRefs(
            parsed,
            refDir,
            mainFileAbsPath,
            registry,
            true,
            newVisited,
            fileCache
        );

        // Merge sibling properties onto the resolved content. Sibling props
        // take precedence (they act as overrides per AsyncAPI 3.x / OAS 3.1).
        if (hasSiblings && resolved != null && typeof resolved === "object" && !Array.isArray(resolved)) {
            return { ...(resolved as Record<string, unknown>), ...siblingProperties };
        }
        return resolved;
    }

    // No external $ref — recursively process every property value
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        result[key] = await resolveExternalRefs(
            value,
            baseDir,
            mainFileAbsPath,
            registry,
            applyRegistry,
            visited,
            fileCache
        );
    }
    return result;
}
