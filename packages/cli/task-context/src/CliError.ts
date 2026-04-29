export class CliError extends Error {
    public readonly code: CliError.Code;
    public readonly docsLink?: string;

    constructor({ message, code, docsLink }: { code: CliError.Code; message?: string; docsLink?: string }) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = this.constructor.name;

        this.code = code;
        this.docsLink = docsLink;
    }

    public static authRequired(message?: string): CliError {
        return new CliError({
            message:
                message ??
                "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable.",
            code: CliError.Code.AuthError
        });
    }

    public static unauthorized(message?: string): CliError {
        return new CliError({
            message:
                message ?? "Unauthorized. Please run 'fern auth login' or set the FERN_TOKEN environment variable.",
            code: CliError.Code.AuthError
        });
    }

    public static notFound(message?: string): CliError {
        return new CliError({ message, code: CliError.Code.ConfigError });
    }

    public static badRequest(message?: string): CliError {
        return new CliError({ message, code: CliError.Code.NetworkError });
    }

    public static validationError(message?: string): CliError {
        return new CliError({ message, code: CliError.Code.ValidationError });
    }

    public static internalError(message?: string): CliError {
        return new CliError({ message, code: CliError.Code.InternalError });
    }
}

export namespace CliError {
    export type Code = (typeof Code)[keyof typeof Code];
    export const Code = {
        InternalError: "INTERNAL_ERROR",
        ResolutionError: "RESOLUTION_ERROR",
        IrConversionError: "IR_CONVERSION_ERROR",
        ContainerError: "CONTAINER_ERROR",
        VersionError: "VERSION_ERROR",
        ParseError: "PARSE_ERROR",
        EnvironmentError: "ENVIRONMENT_ERROR",
        ReferenceError: "REFERENCE_ERROR",
        ValidationError: "VALIDATION_ERROR",
        NetworkError: "NETWORK_ERROR",
        AuthError: "AUTH_ERROR",
        ConfigError: "CONFIG_ERROR",
        UserError: "USER_ERROR"
    } as const;
}

const SENTRY_REPORTABLE: Record<CliError.Code, boolean> = {
    [CliError.Code.InternalError]: true,
    [CliError.Code.ResolutionError]: true,
    [CliError.Code.IrConversionError]: true,
    [CliError.Code.ContainerError]: false,
    [CliError.Code.VersionError]: false,
    [CliError.Code.ParseError]: false,
    [CliError.Code.EnvironmentError]: false,
    [CliError.Code.ReferenceError]: false,
    [CliError.Code.ValidationError]: false,
    [CliError.Code.NetworkError]: false,
    [CliError.Code.AuthError]: false,
    [CliError.Code.ConfigError]: false,
    [CliError.Code.UserError]: false
};

export function shouldReportToSentry(code: CliError.Code): boolean {
    return SENTRY_REPORTABLE[code];
}

function isSchemaValidationError(error: unknown): boolean {
    return error instanceof Error && (error.name === "ParseError" || error.name === "JsonError");
}

function isNodeVersionError(error: unknown): boolean {
    return error instanceof Error && error.message.includes("globalThis");
}

// Node `ErrnoException` codes that represent a problem with the user's
// environment (missing file, bad perms, full disk, closed pipe, …).
// None of these indicate a Fern bug, so they map to EnvironmentError
// which is non-reportable to Sentry.
const USER_ENVIRONMENT_ERRNOS: ReadonlySet<string> = new Set([
    "ENOENT",
    "EACCES",
    "EPERM",
    "EISDIR",
    "ENOTDIR",
    "EEXIST",
    "EPIPE",
    "ENOSPC",
    "EROFS",
    "EMFILE",
    "ENFILE",
    "EBUSY"
]);

// `ErrnoException` codes from `node:net` / `node:dns` / `undici` that mean
// the user cannot reach a remote service. Classified as NetworkError
// (also non-reportable).
const NETWORK_ERRNOS: ReadonlySet<string> = new Set([
    "ENOTFOUND",
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EAI_AGAIN",
    "EPROTO"
]);

function errnoCode(error: unknown): string | undefined {
    if (!(error instanceof Error)) {
        return undefined;
    }
    const code = (error as NodeJS.ErrnoException).code;
    return typeof code === "string" ? code : undefined;
}

/**
 * Resolves the effective error code: explicit override wins,
 * then auto-detects from known error types,
 * and falls back to INTERNAL_ERROR for truly unknown errors.
 */
export function resolveErrorCode(error: unknown, explicitCode?: CliError.Code): CliError.Code {
    if (explicitCode != null) {
        return explicitCode;
    }
    if (error instanceof CliError) {
        return error.code;
    }
    if (isSchemaValidationError(error)) {
        return CliError.Code.ParseError;
    }
    if (isNodeVersionError(error)) {
        return CliError.Code.EnvironmentError;
    }
    const errno = errnoCode(error);
    if (errno != null) {
        if (USER_ENVIRONMENT_ERRNOS.has(errno)) {
            return CliError.Code.EnvironmentError;
        }
        if (NETWORK_ERRNOS.has(errno)) {
            return CliError.Code.NetworkError;
        }
    }
    return CliError.Code.InternalError;
}
