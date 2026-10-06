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

/**
 * Maps the snake_case names of all SDK variables (in IR order) to unique initializer
 * keywords. Names that collide with a reserved option (or any of the caller-supplied
 * `reservedNames`, e.g. credential and global header keywords) are prefixed with
 * `variable_`, and any remaining duplicates (e.g. `rootVariable` and `root_variable`) get a
 * numeric suffix so the generated `Client.new` never declares the same keyword twice.
 */
export function getSdkVariableOptionNames(snakeCaseNames: string[], reservedNames: Iterable<string> = []): string[] {
    const taken = new Set<string>([...RESERVED_SDK_VARIABLE_OPTION_NAMES, ...reservedNames]);
    return snakeCaseNames.map((name) => {
        let candidate = taken.has(name) ? `variable_${name}` : name;
        for (let suffix = 2; taken.has(candidate); suffix++) {
            candidate = `variable_${name}_${suffix}`;
        }
        taken.add(candidate);
        return candidate;
    });
}
