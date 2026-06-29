import type { RawResponse } from "../fetcher/RawResponse.js";

/**
 * A single error entry returned by a GraphQL server in the top-level `errors` array of a
 * response. GraphQL servers respond with HTTP 200 even when an operation fails, returning
 * `{ data: null, errors: [...] }` (or partial data + errors), so these are surfaced through
 * the dedicated {@link GraphqlError} rather than an HTTP status-code error.
 */
export interface GraphqlResponseError {
    message: string;
    path?: (string | number)[];
    extensions?: Record<string, unknown>;
    locations?: { line: number; column: number }[];
}

/**
 * Error thrown when a GraphQL operation returns one or more entries in its top-level `errors`
 * array. Provides typed access to the GraphQL `errors`, any partial `data`, and the raw HTTP
 * response. The `message` summarizes the first error for convenient logging.
 */
export class GraphqlError extends Error {
    public readonly errors: GraphqlResponseError[];
    public readonly data?: unknown;
    public readonly rawResponse?: RawResponse;

    constructor({
        errors,
        data,
        rawResponse,
    }: {
        errors: GraphqlResponseError[];
        data?: unknown;
        rawResponse?: RawResponse;
    }) {
        super(GraphqlError.buildMessage(errors));
        Object.setPrototypeOf(this, GraphqlError.prototype);
        this.name = "GraphqlError";
        this.errors = errors;
        this.data = data;
        this.rawResponse = rawResponse;
        // Conditionally capture the stack trace where available (V8-specific), matching the
        // generated SDK error class pattern.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    private static buildMessage(errors: GraphqlResponseError[]): string {
        if (errors.length === 0) {
            return "GraphQL operation failed";
        }
        const first = errors[0]?.message ?? "GraphQL operation failed";
        if (errors.length === 1) {
            return first;
        }
        return `${first} (and ${errors.length - 1} more error${errors.length - 1 === 1 ? "" : "s"})`;
    }
}
