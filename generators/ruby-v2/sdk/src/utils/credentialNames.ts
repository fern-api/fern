/** The keyword the client has always exposed for a bearer token, ignoring its configured name. */
export const LEGACY_BEARER_PARAMETER_NAME = "token";

/** Initializer keywords the client always exposes, which a credential must not shadow. */
export const RESERVED_CLIENT_OPTION_NAMES = new Set<string>([
    "base_url",
    "environment",
    "max_retries",
    "app_info",
    "client",
    "request_options"
]);

/**
 * The keyword a credential is exposed under. Without `respectAuthSchemeNames` the configured
 * name is used as-is; with it, a name that would shadow a built-in keyword (which Ruby rejects
 * as a duplicate) is suffixed with `_auth`.
 */
export function credentialParameterName(snakeName: string, respectAuthSchemeNames: boolean): string {
    if (!respectAuthSchemeNames) {
        return snakeName;
    }
    return RESERVED_CLIENT_OPTION_NAMES.has(snakeName) ? `${snakeName}_auth` : snakeName;
}

/**
 * The keyword a bearer token is exposed under: its configured name with
 * `respectAuthSchemeNames`, and the legacy `token` keyword otherwise.
 */
export function bearerTokenParameterName(
    configuredSnakeName: string | undefined,
    respectAuthSchemeNames: boolean
): string {
    if (!respectAuthSchemeNames || configuredSnakeName == null) {
        return LEGACY_BEARER_PARAMETER_NAME;
    }
    return credentialParameterName(configuredSnakeName, respectAuthSchemeNames);
}

/**
 * The keyword a global header is exposed under, prefixed with `header_` when it would
 * collide with a credential keyword or a built-in client option.
 */
export function globalHeaderParameterName(
    snakeName: string,
    claimedNames: ReadonlySet<string>,
    respectAuthSchemeNames: boolean
): string {
    if (!respectAuthSchemeNames) {
        return snakeName;
    }
    return RESERVED_CLIENT_OPTION_NAMES.has(snakeName) || claimedNames.has(snakeName)
        ? `header_${snakeName}`
        : snakeName;
}
