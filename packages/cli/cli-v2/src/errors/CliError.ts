export declare namespace CliError {
    /**
     * These codes allow for programmatic error handling and can be used to
     * provide consistent error messages and exit codes.
     */
    export type Code =
        | "AUTH_REQUIRED"
        | "EXIT"
        | "GENERATION_FAILED"
        | "BAD_REQUEST_ERROR"
        | "UNAUTHORIZED_ERROR"
        | "VALIDATION_ERROR"
        | "INTERNAL_ERROR";
}

/**
 * A CLI error with an optional error code for programmatic handling.
 *
 * When a CliError has a code, the error handler can provide consistent
 * formatting and potentially different exit codes for different error types.
 * Errors without a code are displayed as-is.
 */
export class CliError extends Error {
    public readonly code?: CliError.Code;
    public readonly docsLink?: string;

    constructor({
        message,
        code,
        docsLink
    }: {
        message: string;
        code?: CliError.Code;
        docsLink?: string;
    }) {
        super(message);
        this.code = code;
        this.docsLink = docsLink;
    }

    public static authRequired(message?: string): CliError {
        return new CliError({
            message:
                message ??
                "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable.",
            code: "AUTH_REQUIRED"
        });
    }

    public static generationFailed(message?: string): CliError {
        return new CliError({
            message: message ?? "Generation failed. Please check the logs for more information.",
            code: "GENERATION_FAILED"
        });
    }

    public static badRequest(message: string): CliError {
        return new CliError({ message, code: "BAD_REQUEST_ERROR" });
    }

    public static unauthorized(message?: string): CliError {
        return new CliError({
            message:
                message ?? "Unauthorized. Please run 'fern auth login' or set the FERN_TOKEN environment variable.",
            code: "UNAUTHORIZED_ERROR"
        });
    }

    public static validationError(message: string): CliError {
        return new CliError({ message, code: "VALIDATION_ERROR" });
    }

    public static internalError(message: string): CliError {
        return new CliError({ message, code: "INTERNAL_ERROR" });
    }

    /**
     * A sentinel error that causes the CLI to exit with a non-zero exit code, but no message. This
     * is useful when a command handles the failure message itself.
     */
    public static exit(): CliError {
        return new CliError({
            message: "",
            code: "EXIT"
        });
    }
}
