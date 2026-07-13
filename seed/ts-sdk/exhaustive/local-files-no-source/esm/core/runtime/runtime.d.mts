/**
 * A constant that indicates which environment and version the SDK is running in.
 */
export declare const RUNTIME: Runtime;
export interface Runtime {
    type: "browser" | "web-worker" | "deno" | "bun" | "node" | "react-native" | "unknown" | "workerd" | "edge-runtime";
    version?: string;
    parsedVersion?: number;
    /**
     * The operating system the SDK is running on, when it can be determined
     * (e.g. "linux", "darwin", "win32" on server runtimes). Undefined in
     * environments where the OS is not observable (e.g. browsers).
     */
    os?: string;
    /**
     * The CPU architecture the SDK is running on, when it can be determined
     * (e.g. "x64", "arm64" on server runtimes). Undefined in environments where
     * the architecture is not observable (e.g. browsers).
     */
    arch?: string;
}
/**
 * Builds a structured User-Agent string of the form
 *   `{sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}`
 * where the platform group and runtime segment are omitted gracefully when the
 * underlying values cannot be determined (e.g. in a browser).
 */
export declare function getUserAgent(sdkName: string, sdkVersion: string): string;
