/**
 * ClientOptions property names that a client-level SDK variable must not shadow. A variable
 * whose PascalCase name collides with one of these is exposed under a `Variable`-prefixed name.
 */
const RESERVED_SDK_VARIABLE_OPTION_NAMES: ReadonlySet<string> = new Set<string>([
    "BaseUrl",
    "Environment",
    "HttpClient",
    "Headers",
    "AdditionalHeaders",
    "MaxRetries",
    "Timeout",
    "GrpcOptions",
    "ExceptionHandler",
    "IsBaseUrlExplicitlySet",
    "IsEnvironmentExplicitlySet",
    "SetBaseUrl",
    "SetEnvironment",
    "Clone"
]);

/**
 * Returns the ClientOptions property name under which an SDK variable (`variables` in
 * `api.yml` / `x-fern-sdk-variables` in OpenAPI) is exposed. Shared by the SDK generator and
 * the dynamic snippets so both agree on the name.
 */
export function getSdkVariableOptionName(pascalCaseName: string): string {
    if (RESERVED_SDK_VARIABLE_OPTION_NAMES.has(pascalCaseName)) {
        return `Variable${pascalCaseName}`;
    }
    return pascalCaseName;
}
