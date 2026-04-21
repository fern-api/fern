export class CliError extends Error {
    public readonly code: CliError.Code;
    public readonly docsLink?: string;

    constructor({ message, code, docsLink }: { code: CliError.Code; message?: string; docsLink?: string }) {
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
        UserError: "USER_ERROR",
        Unclassified: "UNCLASSIFIED"
    } as const;
}

const SENTRY_REPORTABLE: Record<CliError.Code, boolean> = {
    [CliError.Code.InternalError]: true,
    [CliError.Code.ResolutionError]: true,
    [CliError.Code.IrConversionError]: true,
    [CliError.Code.ContainerError]: true,
    [CliError.Code.VersionError]: true,
    [CliError.Code.ParseError]: false,
    [CliError.Code.EnvironmentError]: false,
    [CliError.Code.ReferenceError]: false,
    [CliError.Code.ValidationError]: false,
    [CliError.Code.NetworkError]: false,
    [CliError.Code.AuthError]: false,
    [CliError.Code.ConfigError]: false,
    [CliError.Code.UserError]: false,
    [CliError.Code.Unclassified]: false
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
 * and falls back to UNCLASSIFIED for unknown errors until all packages
 * are migrated to the new error system.
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
    return CliError.Code.Unclassified;
}
