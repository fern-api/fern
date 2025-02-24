/**
 * Represents an error encountered while parsing OpenAPI specs
 */
export interface OpenApiError {
    /** The error message */
    message: string;
    /** JSON path to where the error occurred */
    path?: string[];
}

/**
 * Collects and stores errors encountered during OpenAPI parsing
 */

export class ErrorCollector {
    private errors: OpenApiError[] = [];

    public collect(error: OpenApiError): void {
        this.errors.push(error);
    }

    public getErrors(): OpenApiError[] {
        return this.errors;
    }
}
