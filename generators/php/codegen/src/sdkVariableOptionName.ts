/**
 * Constructor parameter / client option names already used by generated PHP clients. An SDK
 * variable whose camelCase name collides with one of these is exposed under an
 * `sdkVariable`-prefixed name so it does not shadow an existing option.
 */
const RESERVED_SDK_VARIABLE_OPTION_NAMES: ReadonlySet<string> = new Set<string>([
    "environment",
    "baseUrl",
    "options",
    "client",
    "headers",
    "maxRetries",
    "timeout",
    "appInfo",
    "queryParameters",
    "bodyProperties"
]);

/**
 * Maps the camelCase names of all SDK variables (in IR order) to unique constructor parameter /
 * client option names. Names that collide with a reserved option (or any of the caller-supplied
 * `reservedNames`, e.g. credential and global header parameters) are prefixed with `sdkVariable`,
 * and any remaining duplicates get a numeric suffix so the generated constructor never declares
 * the same parameter twice.
 */
export function getSdkVariableOptionNames(camelCaseNames: string[], reservedNames: Iterable<string> = []): string[] {
    const taken = new Set<string>([...RESERVED_SDK_VARIABLE_OPTION_NAMES, ...reservedNames]);
    return camelCaseNames.map((name) => {
        const prefixed = `sdkVariable${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        let candidate = taken.has(name) ? prefixed : name;
        for (let suffix = 2; taken.has(candidate); suffix++) {
            candidate = `${prefixed}${suffix}`;
        }
        taken.add(candidate);
        return candidate;
    });
}
