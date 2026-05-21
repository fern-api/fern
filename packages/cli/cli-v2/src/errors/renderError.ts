import { CliError, TaskAbortSignal } from "@fern-api/task-context";
import chalk from "chalk";

import { KeyringUnavailableError } from "../auth/errors/KeyringUnavailableError.js";
import { formatIssues, formatViolations, toFormattableViolation } from "./printViolations.js";
import { SourcedValidationError } from "./SourcedValidationError.js";
import { ValidationError } from "./ValidationError.js";

export interface RenderErrorOptions {
    /**
     * Whether the user has opted into debug mode (`--debug` or `FERN_DEBUG=1`).
     * Enables stack/cause-chain rendering for all error classes.
     */
    debug?: boolean;
    /**
     * When true, return a JSON envelope string instead of the human-readable
     * Rust-style block. The envelope shape is {@link ErrorEnvelope}.
     */
    json?: boolean;
    /**
     * Absolute path to the debug log file for the current run. Surfaced in
     * the JSON envelope as `logFile` so CI/agents can attach it to issue
     * reports. Ignored in human mode (the log path is printed separately by
     * `Context.printLogFilePath`).
     */
    logFile?: string;
}

/**
 * Structured error envelope for `--json` mode.
 *
 * This is the public contract for CI/agents. Every field is optional except
 * `ok` (always `false`) and `message`. Callers should **not** assume new
 * fields won't be added — forward-compatible consumers should ignore unknown
 * keys.
 */
export interface ErrorEnvelope {
    ok: false;
    code: CliError.Code | null;
    message: string;
    hint?: string;
    docsLink?: string;
    violations?: ErrorEnvelopeViolation[];
    logFile?: string;
    debug?: ErrorEnvelopeDebug;
}

export interface ErrorEnvelopeViolation {
    severity: string;
    message: string;
    file?: string;
    line?: number;
    column?: number;
    nodePath?: string;
}

export interface ErrorEnvelopeDebug {
    stack?: string;
    causes?: string[];
}

/**
 * Render any thrown value into a multi-line stderr-ready string.
 *
 * The rendering follows a Rust-style envelope so all CLI errors share the
 * same visual shape regardless of which error class they came from:
 *
 * ```
 * error[CODE]: <title>
 *
 * <detail body, e.g. a violation list or source snippet>
 *
 * hint: <next-step affordance>
 * see:  <docs URL>
 * ```
 *
 * Returns `null` for {@link TaskAbortSignal} so the boundary can silently
 * exit on clean shutdowns (Ctrl+C handled upstream).
 */
export function renderError(error: unknown, options: RenderErrorOptions = {}): string | null {
    if (error instanceof TaskAbortSignal) {
        return null;
    }

    if (options.json === true) {
        return JSON.stringify(buildErrorEnvelope(error, options), null, 2);
    }

    if (error instanceof SourcedValidationError) {
        return renderEnvelope({
            code: error.code,
            title: titleForCode(error.code, "Validation failed"),
            detail: formatIssues(error.issues),
            hint: error.hint,
            docsLink: error.docsLink,
            error,
            debug: options.debug
        });
    }

    if (error instanceof ValidationError) {
        return renderEnvelope({
            code: error.code,
            title: titleForCode(error.code, "Validation failed"),
            detail: formatViolations(error.violations.map(toFormattableViolation)),
            hint: error.hint,
            docsLink: error.docsLink,
            error,
            debug: options.debug
        });
    }

    if (error instanceof KeyringUnavailableError) {
        return renderEnvelope({
            code: error.code,
            title: firstLine(error.message) ?? "Cannot access system keyring",
            detail: restAfterFirstLine(error.message),
            hint: error.hint,
            docsLink: error.docsLink,
            error,
            debug: options.debug
        });
    }

    if (error instanceof CliError) {
        return renderEnvelope({
            code: error.code,
            title: firstLine(error.message) ?? titleForCode(error.code, "Command failed"),
            detail: restAfterFirstLine(error.message),
            hint: error.hint,
            docsLink: error.docsLink,
            error,
            debug: options.debug
        });
    }

    if (error instanceof Error) {
        return renderEnvelope({
            code: undefined,
            title: firstLine(error.message) ?? "An unexpected error occurred",
            detail: restAfterFirstLine(error.message),
            hint: undefined,
            docsLink: undefined,
            error,
            debug: options.debug
        });
    }

    return renderEnvelope({
        code: undefined,
        title: stringifyUnknown(error),
        detail: undefined,
        hint: undefined,
        docsLink: undefined,
        error: undefined,
        debug: options.debug
    });
}

interface RenderEnvelopeArgs {
    code: CliError.Code | undefined;
    title: string;
    detail: string | undefined;
    hint: string | undefined;
    docsLink: string | undefined;
    error: Error | undefined;
    debug: boolean | undefined;
}

function renderEnvelope({ code, title, detail, hint, docsLink, error, debug }: RenderEnvelopeArgs): string {
    const lines: string[] = [];
    lines.push(formatHeader(code, title));

    const trimmedDetail = detail?.replace(/^\n+|\n+$/g, "");
    if (trimmedDetail != null && trimmedDetail.length > 0) {
        lines.push("");
        lines.push(trimmedDetail);
    }

    const trailer: string[] = [];
    if (hint != null && hint.length > 0) {
        for (const line of hint.split("\n")) {
            trailer.push(`${chalk.cyan("hint:")} ${line}`);
        }
    }
    if (docsLink != null && docsLink.length > 0) {
        trailer.push(`${chalk.dim("see:")}  ${chalk.blue.underline(docsLink)}`);
    }
    if (trailer.length > 0) {
        lines.push("");
        lines.push(...trailer);
    }

    if (debug === true && error != null) {
        const debugLines = collectDebugLines(error);
        if (debugLines.length > 0) {
            lines.push("");
            lines.push(...debugLines.map((l) => chalk.dim(l)));
        }
    }

    return lines.join("\n");
}

function formatHeader(code: CliError.Code | undefined, title: string): string {
    const prefix = code != null ? `${chalk.red.bold(`error[${code}]`)}${chalk.bold(":")}` : chalk.red.bold("error:");
    return `${prefix} ${chalk.bold(title)}`;
}

function firstLine(text: string | undefined): string | undefined {
    if (text == null || text.length === 0) {
        return undefined;
    }
    const nl = text.indexOf("\n");
    return nl === -1 ? text : text.slice(0, nl);
}

function restAfterFirstLine(text: string | undefined): string | undefined {
    if (text == null) {
        return undefined;
    }
    const nl = text.indexOf("\n");
    if (nl === -1) {
        return undefined;
    }
    const rest = text.slice(nl + 1);
    return rest.length > 0 ? rest : undefined;
}

function titleForCode(code: CliError.Code, fallback: string): string {
    switch (code) {
        case "VALIDATION_ERROR":
            return "Validation failed";
        case "AUTH_ERROR":
            return "Authentication failed";
        case "CONFIG_ERROR":
            return "Configuration error";
        case "NETWORK_ERROR":
            return "Network error";
        case "ENVIRONMENT_ERROR":
            return "Environment error";
        case "CONTAINER_ERROR":
            return "Container error";
        case "PARSE_ERROR":
            return "Parse error";
        case "REFERENCE_ERROR":
            return "Reference error";
        case "RESOLUTION_ERROR":
            return "Resolution failed";
        case "IR_CONVERSION_ERROR":
            return "IR conversion failed";
        case "VERSION_ERROR":
            return "Version mismatch";
        case "USER_ERROR":
            return "Invalid usage";
        default:
            return fallback;
    }
}

function stringifyUnknown(error: unknown): string {
    if (error == null) {
        return "An unknown error occurred";
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        const stringified = JSON.stringify(error);
        if (stringified != null && stringified !== "{}") {
            return stringified;
        }
    } catch {
        // fall through
    }
    return String(error);
}

function collectDebugLines(error: Error): string[] {
    const out: string[] = [];
    if (error.stack != null) {
        out.push(error.stack);
    } else {
        out.push(`${error.name}: ${error.message}`);
    }
    let cause: unknown = (error as { cause?: unknown }).cause;
    let depth = 0;
    while (cause != null && depth < 5) {
        out.push("");
        if (cause instanceof Error) {
            out.push(`caused by: ${cause.name}: ${cause.message}`);
            if (cause.stack != null) {
                out.push(cause.stack);
            }
            cause = (cause as { cause?: unknown }).cause;
        } else {
            out.push(`caused by: ${stringifyUnknown(cause)}`);
            cause = undefined;
        }
        depth += 1;
    }
    return out;
}

// ---------------------------------------------------------------------------
// JSON envelope builder (--json mode)
// ---------------------------------------------------------------------------

function buildErrorEnvelope(error: unknown, options: RenderErrorOptions): ErrorEnvelope {
    const base: ErrorEnvelope = {
        ok: false,
        code: null,
        message: "An unknown error occurred"
    };

    if (error instanceof SourcedValidationError) {
        base.code = error.code;
        base.message = error.message || titleForCode(error.code, "Validation failed");
        if (error.hint != null) {
            base.hint = error.hint;
        }
        if (error.docsLink != null) {
            base.docsLink = error.docsLink;
        }
        base.violations = error.issues.map((issue) => {
            const v: ErrorEnvelopeViolation = {
                severity: "error",
                message: issue.message,
                file: String(issue.location.relativeFilePath),
                line: issue.location.line,
                column: issue.location.column
            };
            return v;
        });
    } else if (error instanceof ValidationError) {
        base.code = error.code;
        base.message = error.message || titleForCode(error.code, "Validation failed");
        if (error.hint != null) {
            base.hint = error.hint;
        }
        if (error.docsLink != null) {
            base.docsLink = error.docsLink;
        }
        base.violations = error.violations.map((violation) => {
            const v: ErrorEnvelopeViolation = {
                severity: violation.severity,
                message: violation.message,
                file: violation.relativeFilepath
            };
            if (violation.nodePath.length > 0) {
                v.nodePath = violation.nodePath
                    .map((seg) => (typeof seg === "string" ? seg : `${seg.key}[${seg.arrayIndex ?? ""}]`))
                    .join(".");
            }
            return v;
        });
    } else if (error instanceof CliError) {
        base.code = error.code;
        base.message = error.message || titleForCode(error.code, "Command failed");
        if (error.hint != null) {
            base.hint = error.hint;
        }
        if (error.docsLink != null) {
            base.docsLink = error.docsLink;
        }
    } else if (error instanceof Error) {
        base.message = error.message || "An unexpected error occurred";
    } else {
        base.message = stringifyUnknown(error);
    }

    if (options.logFile != null) {
        base.logFile = options.logFile;
    }

    if (options.debug === true && error instanceof Error) {
        const debugInfo: ErrorEnvelopeDebug = {};
        if (error.stack != null) {
            debugInfo.stack = error.stack;
        }
        const causes: string[] = [];
        let cause: unknown = (error as { cause?: unknown }).cause;
        let depth = 0;
        while (cause != null && depth < 5) {
            if (cause instanceof Error) {
                causes.push(`${cause.name}: ${cause.message}`);
                cause = (cause as { cause?: unknown }).cause;
            } else {
                causes.push(stringifyUnknown(cause));
                cause = undefined;
            }
            depth += 1;
        }
        if (causes.length > 0) {
            debugInfo.causes = causes;
        }
        if (debugInfo.stack != null || debugInfo.causes != null) {
            base.debug = debugInfo;
        }
    }

    return base;
}
