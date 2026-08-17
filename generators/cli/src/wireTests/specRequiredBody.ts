import { readFile } from "fs/promises";
import yaml from "js-yaml";

/**
 * Reconciles a wire-test case's request body against the *OpenAPI spec's* own
 * `required` list.
 *
 * Why this exists: the CLI and its wire-test cases read from two different
 * sources of truth. A case body comes from an IR example, while the generated
 * CLI validates request bodies against the raw OpenAPI spec it embeds via
 * `include_str!` (`validate_properties` in `sdk/src/openapi/executor.rs` reads
 * `required` straight off the parsed spec). When those two disagree, the CLI
 * refuses to send and the case fails without a request ever reaching the mock.
 *
 * They disagree more often than you'd hope. A property that is `required` in
 * the spec but whose schema permits null — `anyOf: [{type: array}, {type:
 * null}]` is the common shape — can land in the IR as `optional<T>` (or
 * `optional<nullable<T>>` under `wrap-references-to-nullable-in-optional`),
 * at which point example generation legitimately skips it and the resulting
 * example violates the very schema it was generated from.
 *
 * Rather than teach the harness to tolerate that, we repair the body from the
 * spec: any property the spec marks required but the example omits is filled
 * with a value derived from the spec's own schema. Both the mock's expectation
 * and the CLI's validator then agree, because both derive from the spec, and
 * the case goes back to testing the CLI instead of the quality of an example.
 *
 * Filled properties are reported so the manifest can record them
 * (`specFilledBodyProperties`) and a failure stays legible — "this value came
 * from the spec, not from an API author" is exactly what you want to know when
 * such a case goes red.
 */

/** A JSON-Schema-ish node as it appears in an OpenAPI document. */
interface SpecSchema {
    type?: string | string[];
    nullable?: boolean;
    properties?: Record<string, SpecSchema>;
    required?: string[];
    items?: SpecSchema;
    enum?: unknown[];
    const?: unknown;
    anyOf?: SpecSchema[];
    oneOf?: SpecSchema[];
    allOf?: SpecSchema[];
    minItems?: number;
    $ref?: string;
}

/** The required-property contract for one operation's JSON request body. */
export interface RequiredBodyContract {
    required: string[];
    properties: Record<string, SpecSchema>;
    /**
     * The document these schemas came from, so `$ref`s resolve while
     * synthesizing. Carried per contract rather than in module state: the
     * generator can be handed several specs, and contracts are never
     * serialized into the manifest (only the filled property *names* are), so
     * there is no cost to holding it here.
     */
    document: unknown;
}

/** `METHOD normalized/path` → contract. See {@link routeKey}. */
export type RequiredBodyContracts = Map<string, RequiredBodyContract>;

/**
 * How deep we walk composition (`$ref`/`allOf`/`anyOf`/`oneOf`) and nested
 * object filling. Specs in the wild contain cycles; a bound is cheaper and more
 * predictable than cycle detection, and a property we can't reduce inside four
 * hops is one we shouldn't be inventing a value for anyway.
 */
const MAX_SCHEMA_DEPTH = 4;

/**
 * Path parameter names differ between the spec and the IR — Fern renames a path
 * param when it collides with a body field (`idType` → `idTypePathParam`). The
 * *positions* never move, so keying on the path with every `{...}` placeholder
 * collapsed to a single wildcard matches reliably where keying on names would
 * silently miss.
 */
function routeKey(method: string, specPath: string): string {
    const normalizedPath = specPath.replace(/\{[^}]*\}/g, "{}").replace(/\/+$/, "");
    return `${method.toUpperCase()} ${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

/** True when the schema explicitly admits `null`. */
function permitsNull(schema: SpecSchema): boolean {
    if (schema.nullable === true) {
        return true;
    }
    if (schema.type === "null") {
        return true;
    }
    if (Array.isArray(schema.type) && schema.type.includes("null")) {
        return true;
    }
    return [...(schema.anyOf ?? []), ...(schema.oneOf ?? [])].some(
        (branch) => branch.type === "null" || branch.nullable === true
    );
}

/** The single non-null branch of a nullable union, when there is exactly one. */
function soleNonNullBranch(schema: SpecSchema): SpecSchema | undefined {
    const branches = [...(schema.anyOf ?? []), ...(schema.oneOf ?? [])].filter((branch) => branch.type !== "null");
    return branches.length === 1 ? branches[0] : undefined;
}

/**
 * Resolve a local `$ref` (`#/components/schemas/Foo`). Remote and file refs are
 * not resolved: the generator only has this one document in hand, and guessing
 * at an unresolvable reference is worse than declining to fill the property.
 */
function resolveRef(document: unknown, ref: string): SpecSchema | undefined {
    if (!ref.startsWith("#/")) {
        return undefined;
    }
    let cursor: unknown = document;
    for (const rawSegment of ref.slice(2).split("/")) {
        const segment = rawSegment.replaceAll("~1", "/").replaceAll("~0", "~");
        if (typeof cursor !== "object" || cursor === null) {
            return undefined;
        }
        cursor = (cursor as Record<string, unknown>)[segment];
    }
    return isSchemaLike(cursor) ? cursor : undefined;
}

function isSchemaLike(value: unknown): value is SpecSchema {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Follow `$ref` and flatten a single-branch `allOf` so callers see real fields. */
function deref(document: unknown, schema: SpecSchema, depth: number): SpecSchema | undefined {
    if (depth > MAX_SCHEMA_DEPTH) {
        return undefined;
    }
    if (schema.$ref != null) {
        const target = resolveRef(document, schema.$ref);
        return target == null ? undefined : deref(document, target, depth + 1);
    }
    if (schema.allOf != null && schema.allOf.length > 0 && schema.properties == null) {
        const merged: SpecSchema = { type: "object", properties: {}, required: [] };
        for (const branch of schema.allOf) {
            const resolved = deref(document, branch, depth + 1);
            if (resolved == null) {
                continue;
            }
            Object.assign(merged.properties ?? {}, resolved.properties ?? {});
            merged.required = [...(merged.required ?? []), ...(resolved.required ?? [])];
        }
        return merged;
    }
    return schema;
}

/**
 * A value satisfying `schema`, or `undefined` when we can't produce one
 * confidently.
 *
 * `null` is strongly preferred wherever the schema permits it: it is the least
 * invented value available, and it is the shape that actually occurs here — a
 * required property whose schema is a nullable union. Everything else is a
 * minimal, spec-derived placeholder. Declining (returning `undefined`) is a
 * deliberate outcome: leaving the property absent fails the case exactly as it
 * does today, which is more honest than fabricating a value that then trips a
 * different validation rule.
 */
function synthesizeValue(
    document: unknown,
    rawSchema: SpecSchema,
    propertyName: string,
    depth: number
): { value: unknown } | undefined {
    if (depth > MAX_SCHEMA_DEPTH) {
        return undefined;
    }
    const schema = deref(document, rawSchema, depth);
    if (schema == null) {
        return undefined;
    }
    // Prefer the value the author already pinned.
    if (schema.const !== undefined) {
        return { value: schema.const };
    }
    if (schema.enum != null && schema.enum.length > 0) {
        return { value: schema.enum[0] };
    }
    // The case this whole module exists for.
    if (permitsNull(schema)) {
        return { value: null };
    }
    // A union with one real branch is that branch.
    const sole = soleNonNullBranch(schema);
    if (sole != null) {
        return synthesizeValue(document, sole, propertyName, depth + 1);
    }
    const type = Array.isArray(schema.type) ? schema.type.find((t) => t !== "null") : schema.type;
    switch (type) {
        case "string":
            // Matches the autogenerated-example convention (`"segments"` for a
            // `segments` field), so a filled body reads like a generated one.
            return { value: propertyName };
        case "integer":
        case "number":
            return { value: 1 };
        case "boolean":
            return { value: true };
        case "array": {
            if ((schema.minItems ?? 0) <= 0) {
                return { value: [] };
            }
            if (schema.items == null) {
                return undefined;
            }
            const item = synthesizeValue(document, schema.items, propertyName, depth + 1);
            return item == null ? undefined : { value: [item.value] };
        }
        case "object": {
            // Recurse so a nested required property doesn't reintroduce the
            // very failure we're fixing one level down.
            const nested: Record<string, unknown> = {};
            for (const nestedRequired of schema.required ?? []) {
                const nestedSchema = schema.properties?.[nestedRequired];
                if (nestedSchema == null) {
                    return undefined;
                }
                const nestedValue = synthesizeValue(document, nestedSchema, nestedRequired, depth + 1);
                if (nestedValue == null) {
                    return undefined;
                }
                nested[nestedRequired] = nestedValue.value;
            }
            return { value: nested };
        }
        default:
            return undefined;
    }
}

/**
 * Index every operation's JSON request body by route, so
 * {@link reconcileRequiredBodyProperties} can look one up without re-walking
 * the document per case.
 *
 * Only `application/json`-ish bodies are indexed. Multipart and binary bodies
 * don't travel through `--json`, so there is no body for us to repair.
 */
export function buildRequiredBodyContracts(document: unknown): RequiredBodyContracts {
    const contracts: RequiredBodyContracts = new Map();
    if (typeof document !== "object" || document === null) {
        return contracts;
    }
    const paths = (document as { paths?: Record<string, unknown> }).paths;
    if (typeof paths !== "object" || paths === null) {
        return contracts;
    }
    for (const [specPath, rawOperations] of Object.entries(paths)) {
        if (typeof rawOperations !== "object" || rawOperations === null) {
            continue;
        }
        for (const [method, rawOperation] of Object.entries(rawOperations as Record<string, unknown>)) {
            if (!isSchemaLike(rawOperation)) {
                continue;
            }
            const requestBody = (rawOperation as { requestBody?: unknown }).requestBody;
            if (!isSchemaLike(requestBody)) {
                continue;
            }
            const resolvedBody = requestBody.$ref != null ? resolveRef(document, requestBody.$ref) : requestBody;
            const content = (resolvedBody as { content?: Record<string, unknown> } | undefined)?.content;
            if (typeof content !== "object" || content === null) {
                continue;
            }
            const jsonMediaType = Object.keys(content).find((mediaType) => mediaType.includes("json"));
            if (jsonMediaType == null) {
                continue;
            }
            const mediaTypeObject = content[jsonMediaType];
            if (!isSchemaLike(mediaTypeObject)) {
                continue;
            }
            const rawSchema = (mediaTypeObject as { schema?: unknown }).schema;
            if (!isSchemaLike(rawSchema)) {
                continue;
            }
            const schema = deref(document, rawSchema, 0);
            if (schema?.required == null || schema.required.length === 0 || schema.properties == null) {
                continue;
            }
            contracts.set(routeKey(method, specPath), {
                required: schema.required,
                properties: schema.properties,
                document
            });
        }
    }
    return contracts;
}

/** Parse every mounted OpenAPI spec and merge their contracts into one index. */
export async function loadRequiredBodyContracts(specPaths: string[]): Promise<RequiredBodyContracts> {
    const contracts: RequiredBodyContracts = new Map();
    for (const specPath of specPaths) {
        let document: unknown;
        try {
            // `yaml.load` parses JSON too (JSON is a YAML subset), so one call
            // covers both `.json` and `.yml` specs.
            document = yaml.load(await readFile(specPath, "utf-8"));
        } catch {
            // An unreadable or unparseable spec is not this feature's problem to
            // report: the generator's own spec handling already fails loudly on
            // it, and throwing here would turn a wire-test nicety into a
            // generation failure.
            continue;
        }
        for (const [key, contract] of buildRequiredBodyContracts(document)) {
            // First spec wins, matching the CLI: its merged command tree
            // resolves an operation to the first spec that declares it.
            if (!contracts.has(key)) {
                contracts.set(key, contract);
            }
        }
    }
    return contracts;
}

/**
 * How deep into the body we walk looking for required properties. Independent of
 * {@link MAX_SCHEMA_DEPTH}, which bounds *composition* — real bodies nest deeper
 * than their schemas compose.
 */
const MAX_BODY_DEPTH = 8;

/**
 * Recursively repair `value` against `schema`, filling required properties that
 * are absent and descending into the ones that are present.
 *
 * Descending matters: the omission can sit inside a value the example *did*
 * supply — a required, nullable property missing from every element of an array
 * the example populated is the same bug one level down, and a top-level-only
 * pass would leave it. Returns `undefined` when nothing changed, so untouched
 * cases keep their original object identity and can't churn the manifest.
 *
 * `filled` collects JSON-path-ish names (`locators[0].version_id`) so the
 * diagnostic points at the exact spot rather than just the root property.
 */
function repairValue(args: {
    document: unknown;
    schema: SpecSchema;
    value: unknown;
    prefix: string;
    depth: number;
    filled: string[];
}): unknown | undefined {
    const { document, value, prefix, depth, filled } = args;
    if (depth > MAX_BODY_DEPTH) {
        return undefined;
    }
    let schema = deref(document, args.schema, 0);
    if (schema == null) {
        return undefined;
    }
    // A nullable union carries its real shape in the sole non-null branch; the
    // value in hand is non-null or we would not be descending into it.
    const sole = soleNonNullBranch(schema);
    if (sole != null) {
        const resolved = deref(document, sole, 0);
        if (resolved != null) {
            schema = resolved;
        }
    }

    if (Array.isArray(value)) {
        if (schema.items == null) {
            return undefined;
        }
        let changed = false;
        const repairedItems = value.map((item, index) => {
            const repairedItem = repairValue({
                document,
                schema: schema.items as SpecSchema,
                value: item,
                prefix: `${prefix}[${index}]`,
                depth: depth + 1,
                filled
            });
            if (repairedItem === undefined) {
                return item;
            }
            changed = true;
            return repairedItem;
        });
        return changed ? repairedItems : undefined;
    }

    if (typeof value !== "object" || value === null) {
        // A scalar has no required properties to be missing.
        return undefined;
    }

    const current = value as Record<string, unknown>;
    const repaired: Record<string, unknown> = { ...current };
    let changed = false;

    for (const requiredName of schema.required ?? []) {
        if (Object.hasOwn(current, requiredName)) {
            continue;
        }
        const propertySchema = schema.properties?.[requiredName];
        if (propertySchema == null) {
            continue;
        }
        const synthesized = synthesizeValue(document, propertySchema, requiredName, 0);
        if (synthesized == null) {
            continue;
        }
        repaired[requiredName] = synthesized.value;
        filled.push(prefix === "" ? requiredName : `${prefix}.${requiredName}`);
        changed = true;
    }

    // Descend into what the example already provided.
    for (const [name, nested] of Object.entries(current)) {
        const nestedSchema = schema.properties?.[name];
        if (nestedSchema == null || nested == null) {
            continue;
        }
        const repairedNested = repairValue({
            document,
            schema: nestedSchema,
            value: nested,
            prefix: prefix === "" ? name : `${prefix}.${name}`,
            depth: depth + 1,
            filled
        });
        if (repairedNested !== undefined) {
            repaired[name] = repairedNested;
            changed = true;
        }
    }

    return changed ? repaired : undefined;
}

/**
 * Fill any required-by-the-spec property the example body omits, at any depth.
 *
 * Returns the body unchanged (and no filled names) when there is nothing to do,
 * which is the overwhelmingly common case — this only bites where the IR and the
 * spec disagree about whether a property is required.
 *
 * A non-object body is left alone: if an endpoint's example has no body at all,
 * or a scalar one, inventing an object is a bigger leap than reporting the
 * mismatch.
 */
export function reconcileRequiredBodyProperties(args: {
    body: unknown;
    method: string;
    path: string;
    contracts: RequiredBodyContracts;
}): { body: unknown; filled: string[] } {
    const { body, method, path, contracts } = args;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return { body, filled: [] };
    }
    const contract = contracts.get(routeKey(method, path));
    if (contract == null) {
        return { body, filled: [] };
    }
    const filled: string[] = [];
    const repaired = repairValue({
        document: contract.document,
        schema: { type: "object", required: contract.required, properties: contract.properties },
        value: body,
        prefix: "",
        depth: 0,
        filled
    });
    return repaired === undefined ? { body, filled: [] } : { body: repaired, filled };
}
