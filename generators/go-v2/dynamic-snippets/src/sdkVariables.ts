/**
 * RequestOptions field names that a client-level variable must not shadow. Kept in
 * sync with the reserved names in the Go v1 generator (sdk.go).
 */
export const RESERVED_OPTION_NAMES: ReadonlySet<string> = new Set<string>([
    "BaseURL",
    "Environment",
    "HTTPClient",
    "HTTPHeader",
    "BodyProperties",
    "QueryParameters",
    "MaxAttempts",
    "MaxBufSize",
    "MaxStreamReconnectAttempts",
    "DisableStreamReconnection",
    "DisableRetries"
]);

export interface SdkVariableNames {
    /** Exported identifier used for the RequestOptions field, option struct and With<Name> helper. */
    fieldName: string;
    /** Unexported identifier used for parameters and local variables. */
    localName: string;
}

/**
 * Returns the Go identifiers an SDK variable (bound to path parameters via
 * x-fern-sdk-variable) is exposed under, de-collided against reserved option names.
 */
export function getSdkVariableNames({ pascal, camel }: { pascal: string; camel: string }): SdkVariableNames {
    if (RESERVED_OPTION_NAMES.has(pascal)) {
        return { fieldName: `Variable${pascal}`, localName: `variable${pascal}` };
    }
    return { fieldName: pascal, localName: camel };
}
