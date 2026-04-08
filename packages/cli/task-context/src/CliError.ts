export class CliError extends Error {
    public readonly code: CliError.Code;
    public readonly docsLink?: string;

    constructor({ message, code, docsLink }: { message: string; code: CliError.Code; docsLink?: string }) {
        super(message);
        Object.setPrototypeOf(this, CliError.prototype);
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

    public static notFound(message: string): CliError {
        return new CliError({ message, code: CliError.Code.ConfigError });
    }

    public static badRequest(message: string): CliError {
        return new CliError({ message, code: CliError.Code.NetworkError });
    }

    public static validationError(message: string): CliError {
        return new CliError({ message, code: CliError.Code.ValidationError });
    }

    public static internalError(message: string): CliError {
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
        ConfigError: "CONFIG_ERROR"
    } as const;
}

const SENTRY_REPORTABLE: Record<CliError.Code, boolean> = {
    INTERNAL_ERROR: true,
    RESOLUTION_ERROR: true,
    IR_CONVERSION_ERROR: true,
    CONTAINER_ERROR: true,
    VERSION_ERROR: true,
    PARSE_ERROR: false,
    ENVIRONMENT_ERROR: false,
    REFERENCE_ERROR: false,
    VALIDATION_ERROR: false,
    NETWORK_ERROR: false,
    AUTH_ERROR: false,
    CONFIG_ERROR: false
};

export function shouldReportToSentry(code: CliError.Code): boolean {
    return SENTRY_REPORTABLE[code];
}

function isSchemaValidationError(error: unknown): boolean {
    return (
        error instanceof Error && (error.constructor.name === "ParseError" || error.constructor.name === "JsonError")
    );
}

function isNodeVersionError(error: unknown): boolean {
    return error instanceof Error && error.message.includes("globalThis");
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
    return CliError.Code.InternalError;
}
