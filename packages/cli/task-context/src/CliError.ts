export const CliErrorCode = {
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

export type CliErrorCode = (typeof CliErrorCode)[keyof typeof CliErrorCode];

const SENTRY_REPORTABLE: Record<CliErrorCode, boolean> = {
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

export function shouldReportToSentry(code: CliErrorCode): boolean {
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
export function resolveErrorCode(error: unknown, explicitCode?: CliErrorCode): CliErrorCode {
    if (explicitCode != null) {
        return explicitCode;
    }
    if (error instanceof CliError) {
        return error.code;
    }
    if (isSchemaValidationError(error)) {
        return "PARSE_ERROR";
    }
    if (isNodeVersionError(error)) {
        return "ENVIRONMENT_ERROR";
    }
    return "INTERNAL_ERROR";
}

export class CliError extends Error {
    public readonly code: CliErrorCode;
    public readonly docsLink?: string;

    constructor({ message, code, docsLink }: { message: string; code: CliErrorCode; docsLink?: string }) {
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
            code: "AUTH_ERROR"
        });
    }

    public static unauthorized(message?: string): CliError {
        return new CliError({
            message:
                message ?? "Unauthorized. Please run 'fern auth login' or set the FERN_TOKEN environment variable.",
            code: "AUTH_ERROR"
        });
    }

    public static notFound(message: string): CliError {
        return new CliError({ message, code: "CONFIG_ERROR" });
    }

    public static badRequest(message: string): CliError {
        return new CliError({ message, code: "NETWORK_ERROR" });
    }

    public static validationError(message: string): CliError {
        return new CliError({ message, code: "VALIDATION_ERROR" });
    }

    public static internalError(message: string): CliError {
        return new CliError({ message, code: "INTERNAL_ERROR" });
    }
}
