/**
 * Keywords the generated client always exposes, or uses internally, and which a
 * configured credential or global header name therefore cannot be exposed under.
 */
export const RESERVED_CLIENT_OPTION_NAMES = new Set<string>([
    "base_url",
    "environment",
    "max_retries",
    "app_info",
    "client",
    "request_options"
]);

/**
 * De-collides the keyword a credential is exposed under. The configured name is kept
 * unless it shadows one of the client's built-in keywords, which Ruby rejects as a
 * duplicate parameter.
 * @param snakeName The configured credential name in Ruby snake case.
 */
export function credentialParameterName(snakeName: string): string {
    return RESERVED_CLIENT_OPTION_NAMES.has(snakeName) ? `${snakeName}_auth` : snakeName;
}

/**
 * De-collides the keyword a global header is exposed under, against the client's
 * built-in keywords and the keywords already claimed by credentials.
 * @param snakeName The header's name in Ruby snake case.
 * @param claimedNames Keywords already claimed by credential parameters.
 */
export function globalHeaderParameterName(snakeName: string, claimedNames: ReadonlySet<string>): string {
    return RESERVED_CLIENT_OPTION_NAMES.has(snakeName) || claimedNames.has(snakeName)
        ? `header_${snakeName}`
        : snakeName;
}
