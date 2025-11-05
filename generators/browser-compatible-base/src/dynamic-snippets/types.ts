/**
 * Thin, structural interfaces for dynamic snippets generation.
 * These interfaces capture only the minimal surface needed by the base generator,
 * enabling backwards compatibility across IR versions.
 */

/**
 * Minimal endpoint location interface.
 */
export interface EndpointLocationLike {
    method: string;
    path: string;
}

/**
 * Environment values can be either a single environment ID (string)
 * or multiple environment URLs (Record<string, string>).
 */
export type EnvironmentValuesLike = string | Record<string, string>;

/**
 * Authentication values for different auth schemes.
 * Uses optional fields to be compatible with various IR versions.
 */
export type AuthValuesLike =
    | { type: "basic"; username: string; password: string }
    | { type: "bearer"; token: string }
    | { type: "header"; value?: unknown }
    | { type: "oauth"; clientId: string; clientSecret: string }
    | { type: "inferred" };

/**
 * Minimal endpoint snippet request interface.
 * Field names match the IR for structural compatibility.
 */
export interface EndpointSnippetRequestLike {
    endpoint: EndpointLocationLike;
    baseUrl?: string;
    environment?: EnvironmentValuesLike;
    auth?: AuthValuesLike;
    pathParameters?: Record<string, unknown>;
    queryParameters?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    requestBody?: unknown;
}

/**
 * Error severity levels (matches ErrorReporter.Severity).
 */
export type ErrorSeverityLike = "CRITICAL" | "WARNING";

/**
 * Error information.
 */
export interface ErrorLike {
    severity: ErrorSeverityLike;
    path?: string[];
    message: string;
}

/**
 * Minimal endpoint snippet response interface.
 */
export interface EndpointSnippetResponseLike {
    snippet: string;
    errors?: ErrorLike[];
}

/**
 * Minimal error reporter interface (matches ErrorReporter public API).
 */
export interface ErrorReporterLike {
    empty(): boolean;
    add(error: { severity: ErrorSeverityLike; message: string }): void;
    scope(scope: string | { index: number }): void;
    unscope(): void;
}

/**
 * Minimal endpoint interface used internally.
 * Only requires location to be structurally compatible with IR Endpoint.
 */
export interface EndpointLike {
    location: EndpointLocationLike;
}

/**
 * Minimal context interface that AbstractDynamicSnippetsGenerator depends on.
 * Generic over EndpointT for backwards compatibility with different IR versions.
 */
export interface DynamicSnippetsGeneratorContextLike<EndpointT extends EndpointLike = EndpointLike> {
    errors: ErrorReporterLike;
    resolveEndpointLocationOrThrow(location: EndpointLocationLike): EndpointT[];
    clone(): DynamicSnippetsGeneratorContextLike<EndpointT>;
}

/**
 * Minimal endpoint snippet generator interface.
 * Generic over Context, EndpointT, and RequestT for backwards compatibility.
 */
export interface EndpointSnippetGeneratorLike<
    Context extends DynamicSnippetsGeneratorContextLike<EndpointT>,
    EndpointT extends EndpointLike = EndpointLike,
    RequestT extends EndpointSnippetRequestLike = EndpointSnippetRequestLike
> {
    generateSnippet(args: { endpoint: EndpointT; request: RequestT; options?: unknown }): Promise<string>;
    generateSnippetSync(args: { endpoint: EndpointT; request: RequestT; options?: unknown }): string;
}
