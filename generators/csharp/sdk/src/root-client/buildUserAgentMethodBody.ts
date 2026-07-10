/**
 * Source-building helpers for the generated static `BuildUserAgent` method that
 * produces a structured `User-Agent` of the shape
 * `{sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}`
 * (e.g. `my-sdk/1.2.0 (linux; x64) .NET/8.0.4`).
 *
 * The OS/architecture group is omitted when neither can be determined (and
 * reduced to a single value when only one is), and the runtime version is
 * dropped when unavailable, so the header never contains an empty `()` group,
 * never emits a literal `undefined`, and the helper never throws.
 *
 * These are split out from the generator so the deterministic C# body can be
 * unit-tested without constructing a full generation context.
 */

export const BUILD_USER_AGENT_METHOD_NAME = "BuildUserAgent";

const RUNTIME_INFORMATION = "global::System.Runtime.InteropServices.RuntimeInformation";
const OS_PLATFORM = "global::System.Runtime.InteropServices.OSPlatform";

/**
 * The C# statements computing the `os`, `arch`, `platform`, and `runtime`
 * locals — everything preceding the interpolated `return`.
 */
export function buildUserAgentLocalLines(): string[] {
    return [
        `var os = ${RUNTIME_INFORMATION}.IsOSPlatform(${OS_PLATFORM}.Windows) ? "windows"`,
        `    : ${RUNTIME_INFORMATION}.IsOSPlatform(${OS_PLATFORM}.Linux) ? "linux"`,
        `    : ${RUNTIME_INFORMATION}.IsOSPlatform(${OS_PLATFORM}.OSX) ? "osx"`,
        '    : "";',
        `var arch = ${RUNTIME_INFORMATION}.ProcessArchitecture.ToString().ToLowerInvariant();`,
        "var platform = os.Length > 0 && arch.Length > 0",
        '    ? $" ({os}; {arch})"',
        "    : os.Length > 0",
        '        ? $" ({os})"',
        "        : arch.Length > 0",
        '            ? $" ({arch})"',
        '            : "";',
        "var runtimeVersion = global::System.Environment.Version.ToString();",
        'var runtime = runtimeVersion.Length > 0 ? $" .NET/{runtimeVersion}" : " .NET";'
    ];
}

/**
 * The start of the `return` statement, up to (but excluding) the runtime version
 * expression. The caller writes the version via `writeNode` so the generated
 * `Version` reference registers its using directive, then appends
 * {@link BUILD_USER_AGENT_RETURN_SUFFIX}.
 */
export function buildUserAgentReturnPrefix(packageName: string): string {
    return `return $"${packageName}/{`;
}

export const BUILD_USER_AGENT_RETURN_SUFFIX = '}{platform}{runtime}";';
