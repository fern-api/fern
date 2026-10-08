import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { CliCatalogCommand, CliCatalogInput } from "./types.js";

type ExampleEndpointCall = FdrCjsSdk.api.v1.register.ExampleEndpointCall;

/** The command's catch-all flag for nested/array inputs the runtime can't express as a dedicated flag. */
const PARAMS_FLAG = "--params";

/**
 * The command's raw-body flag. Required for endpoints whose OpenAPI body uses *literal dotted* wire
 * names (e.g. Twilio `calls streams create` with `Parameter1.Name`): the runtime misreads the dot in
 * both the dedicated flag and in `--params` as nesting and sends `{Parameter1:{Name}}`, which its own
 * validator then rejects. Only `--json` with the verbatim body sends `Parameter1.Name=...` correctly.
 * `--json` cannot be combined with per-field body flags, so when it fires the whole body goes through it.
 * (The underlying dot-handling bug is tracked separately against generators/cli/sdk.)
 */
const JSON_BODY_FLAG = "--json";

/**
 * Assemble a concrete CLI command string for one FDR endpoint example.
 *
 * Values are pulled from the example by the input's `location` + `wireName` (reconciled
 * case/kebab-insensitively — see {@link readByKey}). Each input is emitted using the `flag` the
 * catalog carries verbatim from `--schema`. Inputs with no `flag` — plus any value the runtime
 * couldn't accept through a scalar flag (nested objects, arrays-of-objects) — are collected into a
 * single `--params '<...>'` payload, the runtime's catch-all for everything a flat flag can't carry.
 */
export function assembleCliCommand(command: CliCatalogCommand, example: ExampleEndpointCall): string {
    const tokens: string[] = [...command.command];
    const bodyValue = extractBodyValue(example);
    const paramsPayload: Record<string, unknown> = {};
    let hasParamsPayload = false;

    // Literal dotted body keys force the whole body through --json (see JSON_BODY_FLAG). An input is a
    // literal dotted key when its body wire name contains a dot but the catalog left `path` unset —
    // real nested fields always carry `path`, so this cleanly distinguishes the two.
    const bodyNeedsJson = command.inputs.some(
        (input) => input.location === "body" && input.path == null && input.wireName.includes(".")
    );

    const routeToParams = (input: CliCatalogInput, value: unknown): void => {
        setByPath(paramsPayload, input.path ?? [input.wireName], value);
        hasParamsPayload = true;
    };

    for (const input of command.inputs) {
        // When --json carries the body, skip every per-field body flag (they can't coexist with --json).
        if (input.location === "body" && bodyNeedsJson) {
            continue;
        }
        const container = resolveContainer(input, example, bodyValue);
        const value = readByPath(container, input.path ?? [input.wireName]);
        if (value === undefined || value === null) {
            continue;
        }

        // No dedicated flag → the runtime only accepts this input via --params.
        if (input.flag == null) {
            routeToParams(input, value);
            continue;
        }

        if (Array.isArray(value)) {
            if (input.repeated === true) {
                for (const element of value) {
                    if (element !== undefined && element !== null) {
                        tokens.push(input.flag, shellQuote(formatScalar(element)));
                    }
                }
            } else {
                // A non-repeated array can't be expressed as a single scalar flag value.
                routeToParams(input, value);
            }
            continue;
        }

        if (isPlainObject(value)) {
            // Objects aren't scalar flag values either; let --params carry the structure.
            routeToParams(input, value);
            continue;
        }

        tokens.push(input.flag, shellQuote(formatScalar(value)));
    }

    if (bodyNeedsJson && isPlainObject(bodyValue) && Object.keys(bodyValue).length > 0) {
        tokens.push(JSON_BODY_FLAG, shellQuote(JSON.stringify(bodyValue)));
    }
    if (hasParamsPayload) {
        tokens.push(PARAMS_FLAG, shellQuote(JSON.stringify(paramsPayload)));
    }

    return tokens.join(" ");
}

function resolveContainer(
    input: CliCatalogInput,
    example: ExampleEndpointCall,
    bodyValue: unknown
): Record<string, unknown> | unknown {
    switch (input.location) {
        case "path":
            return example.pathParameters;
        case "query":
            return example.queryParameters;
        case "header":
            return example.headers;
        case "body":
            return bodyValue;
        default:
            return undefined;
    }
}

/**
 * Normalize the example's request body into a plain object keyed by OpenAPI property name, matching
 * how the catalog's body inputs are keyed. Prefers `requestBodyV3` (json/form) and falls back to the
 * legacy `requestBody`.
 */
function extractBodyValue(example: ExampleEndpointCall): unknown {
    const v3 = example.requestBodyV3;
    if (v3 != null) {
        if (v3.type === "json") {
            return v3.value;
        }
        if (v3.type === "form") {
            const out: Record<string, unknown> = {};
            for (const [key, formValue] of Object.entries(v3.value ?? {})) {
                out[key] = unwrapFormValue(formValue);
            }
            return out;
        }
        // bytes / other request bodies aren't expressible as flat flags; leave undefined.
        return undefined;
    }
    return example.requestBody;
}

function unwrapFormValue(formValue: unknown): unknown {
    if (isPlainObject(formValue) && "value" in formValue) {
        return (formValue as { value: unknown }).value;
    }
    return formValue;
}

/** Walk a key path, reconciling each segment case/kebab-insensitively against the container's keys. */
function readByPath(container: unknown, path: string[]): unknown {
    let current: unknown = container;
    for (const segment of path) {
        if (!isPlainObject(current)) {
            return undefined;
        }
        current = readByKey(current, segment);
    }
    return current;
}

/**
 * Read a key from an object, tolerating divergence between the catalog wire name and the FDR field
 * key: exact match first, then case-insensitive, then kebab-normalized (strips `-`/`_`, lowercases).
 * This absorbs casing drift (`AccountSid` vs `accountSid`) without silently matching unrelated keys.
 */
function readByKey(obj: Record<string, unknown>, key: string): unknown {
    if (key in obj) {
        return obj[key];
    }
    const lowered = key.toLowerCase();
    for (const [candidate, value] of Object.entries(obj)) {
        if (candidate.toLowerCase() === lowered) {
            return value;
        }
    }
    const normalizedKey = normalizeIdentifier(key);
    for (const [candidate, value] of Object.entries(obj)) {
        if (normalizeIdentifier(candidate) === normalizedKey) {
            return value;
        }
    }
    return undefined;
}

function normalizeIdentifier(value: string): string {
    return value.toLowerCase().replace(/[-_]/g, "");
}

function setByPath(target: Record<string, unknown>, path: string[], value: unknown): void {
    let current = target;
    for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i] as string;
        const next = current[segment];
        if (!isPlainObject(next)) {
            current[segment] = {};
        }
        current = current[segment] as Record<string, unknown>;
    }
    current[path[path.length - 1] as string] = value;
}

function formatScalar(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    return String(value);
}

/** POSIX single-quote only when needed, so simple values stay readable. */
function shellQuote(value: string): string {
    if (value.length > 0 && /^[A-Za-z0-9_.:/@%+=-]+$/.test(value)) {
        return value;
    }
    return `'${value.replace(/'/g, "'\\''")}'`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
