/**
 * Initializer keywords already used by generated Ruby clients. An SDK variable whose
 * snake_case name collides with one of these is exposed under a `variable_`-prefixed
 * keyword so it does not shadow an existing option.
 */
const RESERVED_SDK_VARIABLE_OPTION_NAMES: ReadonlySet<string> = new Set<string>([
    "base_url",
    "environment",
    "max_retries",
    "timeout",
    "token",
    "client",
    "request_options",
    "app_info",
    "http_client"
]);

export function getSdkVariableOptionName(snakeCaseName: string): string {
    if (RESERVED_SDK_VARIABLE_OPTION_NAMES.has(snakeCaseName)) {
        return `variable_${snakeCaseName}`;
    }
    return snakeCaseName;
}
