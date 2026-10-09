/**
 * The value → command-string kernel, carried over from the publish-time catalog assembler
 * (`packages/cli/register/src/cli-snippets/assembleCliCommand.ts`, PR #18194). The dynamic-snippets
 * generator decides *which* flag each input maps to (via the ported naming rules); this builder owns
 * *how* the resolved flags, the `--params` catch-all, and the `--json` raw body are rendered and
 * shell-quoted into the final command line.
 */

/** The command's catch-all flag for nested/array inputs the runtime can't express as a dedicated flag. */
const PARAMS_FLAG = "--params";

/**
 * The command's raw-body flag. Required for endpoints whose OpenAPI body uses *literal dotted* wire
 * names (e.g. Twilio `Parameter1.Name`): the runtime misreads the dot in both the dedicated flag and
 * in `--params` as nesting. Only `--json` with the verbatim body sends the literal key correctly.
 * `--json` cannot be combined with per-field body flags, so when it fires the whole body goes through it.
 */
const JSON_BODY_FLAG = "--json";

/** Accumulates the tokens, `--params` payload, and `--json` body of one CLI command and renders them. */
export class CliCommandBuilder {
    private readonly tokens: string[];
    private readonly paramsPayload: Record<string, unknown> = {};
    private hasParamsPayload = false;
    private jsonBody: unknown = undefined;

    constructor(prefix: string[]) {
        this.tokens = [...prefix];
    }

    /** Emit a scalar flag: `--flag value` (value shell-quoted). */
    public pushFlag(flag: string, value: unknown): void {
        this.tokens.push(flag, shellQuote(formatScalar(value)));
    }

    /** Emit a repeated flag, once per array element: `--flag a --flag b`. */
    public pushRepeatedFlag(flag: string, values: unknown[]): void {
        for (const element of values) {
            if (element !== undefined && element !== null) {
                this.tokens.push(flag, shellQuote(formatScalar(element)));
            }
        }
    }

    /** Route a value the runtime can only accept through `--params` (flagless, nested, array-of-object). */
    public routeToParams(path: string[], value: unknown): void {
        setByPath(this.paramsPayload, path, value);
        this.hasParamsPayload = true;
    }

    /** Send the entire request body verbatim through `--json` (literal-dotted-key bodies). */
    public setJsonBody(value: unknown): void {
        this.jsonBody = value;
    }

    public build(): string {
        const tokens = [...this.tokens];
        if (isPlainObject(this.jsonBody) && Object.keys(this.jsonBody).length > 0) {
            tokens.push(JSON_BODY_FLAG, shellQuote(JSON.stringify(this.jsonBody)));
        }
        if (this.hasParamsPayload) {
            tokens.push(PARAMS_FLAG, shellQuote(JSON.stringify(this.paramsPayload)));
        }
        return tokens.join(" ");
    }
}

export function formatScalar(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    return String(value);
}

/** POSIX single-quote only when needed, so simple values stay readable. */
export function shellQuote(value: string): string {
    if (value.length > 0 && /^[A-Za-z0-9_.:/@%+=-]+$/.test(value)) {
        return value;
    }
    return `'${value.replace(/'/g, "'\\''")}'`;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
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
