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
}
