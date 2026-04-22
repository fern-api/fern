export declare namespace GeneratorError {
    /**
     * Error codes used by generator runtimes to distinguish user-facing errors
     * from internal Fern bugs.
     */
    export type Code =
        | "INTERNAL_ERROR"
        | "RESOLUTION_ERROR"
        | "IR_CONVERSION_ERROR"
        | "CONTAINER_ERROR"
        | "VERSION_ERROR"
        | "PARSE_ERROR"
        | "ENVIRONMENT_ERROR"
        | "REFERENCE_ERROR"
        | "VALIDATION_ERROR"
        | "NETWORK_ERROR"
        | "AUTH_ERROR"
        | "CONFIG_ERROR";
}

const SENTRY_REPORTABLE_CODES: ReadonlySet<GeneratorError.Code> = new Set<GeneratorError.Code>([
    "INTERNAL_ERROR",
    "RESOLUTION_ERROR",
    "IR_CONVERSION_ERROR",
    "CONTAINER_ERROR",
    "VERSION_ERROR"
]);

export class GeneratorError extends Error {
    public readonly code: GeneratorError.Code;

    constructor({ message, code }: { message: string; code: GeneratorError.Code }) {
        super(message);
        this.code = code;
    }

    public static internalError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "INTERNAL_ERROR" });
    }

    public static resolutionError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "RESOLUTION_ERROR" });
    }

    public static irConversionError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "IR_CONVERSION_ERROR" });
    }

    public static containerError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "CONTAINER_ERROR" });
    }

    public static versionError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "VERSION_ERROR" });
    }

    public static parseError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "PARSE_ERROR" });
    }

    public static environmentError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "ENVIRONMENT_ERROR" });
    }

    public static referenceError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "REFERENCE_ERROR" });
    }

    public static validationError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "VALIDATION_ERROR" });
    }

    public static networkError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "NETWORK_ERROR" });
    }

    public static authError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "AUTH_ERROR" });
    }

    public static configError(message: string): GeneratorError {
        return new GeneratorError({ message, code: "CONFIG_ERROR" });
    }
}

export function resolveErrorCode(error: unknown): GeneratorError.Code {
    if (error instanceof GeneratorError) {
        return error.code;
    }
    return "INTERNAL_ERROR";
}

export function shouldReportToSentry(error: unknown): boolean {
    return SENTRY_REPORTABLE_CODES.has(resolveErrorCode(error));
}
