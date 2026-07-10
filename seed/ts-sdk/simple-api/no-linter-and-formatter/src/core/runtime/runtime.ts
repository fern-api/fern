interface DenoGlobal {
    version: {
        deno: string;
    };
    build?: {
        os?: string;
        arch?: string;
    };
}

interface BunGlobal {
    version: string;
}

declare const Deno: DenoGlobal | undefined;
declare const Bun: BunGlobal | undefined;
declare const EdgeRuntime: string | undefined;
declare const self: typeof globalThis.self & {
    importScripts?: unknown;
};

/**
 * A constant that indicates which environment and version the SDK is running in.
 */
export const RUNTIME: Runtime = evaluateRuntime();

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

function evaluateRuntime(): Runtime {
    /**
     * A constant that indicates whether the environment the code is running is a Web Browser.
     */
    const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
    if (isBrowser) {
        return {
            type: "browser",
            version: window.navigator.userAgent,
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is Cloudflare.
     * https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
     */
    const isCloudflare = typeof globalThis !== "undefined" && globalThis?.navigator?.userAgent === "Cloudflare-Workers";
    if (isCloudflare) {
        return {
            type: "workerd",
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is Edge Runtime.
     * https://vercel.com/docs/functions/runtimes/edge-runtime#check-if-you're-running-on-the-edge-runtime
     */
    const isEdgeRuntime = typeof EdgeRuntime === "string";
    if (isEdgeRuntime) {
        return {
            type: "edge-runtime",
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is a Web Worker.
     */
    const isWebWorker =
        typeof self === "object" &&
        typeof self?.importScripts === "function" &&
        (self.constructor?.name === "DedicatedWorkerGlobalScope" ||
            self.constructor?.name === "ServiceWorkerGlobalScope" ||
            self.constructor?.name === "SharedWorkerGlobalScope");
    if (isWebWorker) {
        return {
            type: "web-worker",
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is Deno.
     * FYI Deno spoofs process.versions.node, see https://deno.land/std@0.177.0/node/process.ts?s=versions
     */
    const isDeno =
        typeof Deno !== "undefined" && typeof Deno.version !== "undefined" && typeof Deno.version.deno !== "undefined";
    if (isDeno) {
        return {
            type: "deno",
            version: Deno.version.deno,
            os: Deno.build?.os,
            arch: Deno.build?.arch,
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is Bun.sh.
     */
    const isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
    if (isBun) {
        return {
            type: "bun",
            version: Bun.version,
            os: typeof process !== "undefined" ? process.platform : undefined,
            arch: typeof process !== "undefined" ? process.arch : undefined,
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is in React-Native.
     * This check should come before Node.js detection since React Native may have a process polyfill.
     * https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/Core/setUpNavigator.js
     */
    const isReactNative = typeof navigator !== "undefined" && navigator?.product === "ReactNative";
    if (isReactNative) {
        return {
            type: "react-native",
        };
    }

    /**
     * A constant that indicates whether the environment the code is running is Node.JS.
     *
     * We assign `process` to a local variable first to avoid being flagged by
     * bundlers that perform static analysis on `process.versions` (e.g. Next.js
     * Edge Runtime warns about Node.js APIs even when they are guarded).
     */
    const _process = typeof process !== "undefined" ? process : undefined;
    const isNode =
        typeof _process !== "undefined" &&
        typeof _process.versions?.node === "string";
    if (isNode) {
        return {
            type: "node",
            version: _process.versions.node,
            parsedVersion: Number(_process.versions.node.split(".")[0]),
            os: _process.platform,
            arch: _process.arch,
        };
    }

    return {
        type: "unknown",
    };
}

/**
 * Display names for the language runtimes whose version is meaningful to encode
 * in a User-Agent. Environments where a version string is not useful (e.g.
 * browsers, where `version` is the full navigator UA) are intentionally mapped
 * to `undefined` so they are omitted from the User-Agent.
 */
const RUNTIME_DISPLAY_NAMES: Record<Runtime["type"], string | undefined> = {
    node: "Node",
    deno: "Deno",
    bun: "Bun",
    browser: undefined,
    "web-worker": undefined,
    "react-native": undefined,
    workerd: undefined,
    "edge-runtime": undefined,
    unknown: undefined,
};

/**
 * Builds a structured User-Agent string of the form
 *   `{sdkName}/{sdkVersion} ({os}; {arch}) {runtime}/{runtimeVersion}`
 * where the platform group and runtime segment are omitted gracefully when the
 * underlying values cannot be determined (e.g. in a browser).
 */
export function getUserAgent(sdkName: string, sdkVersion: string): string {
    let userAgent = `${sdkName}/${sdkVersion}`;

    const platform = [RUNTIME.os, RUNTIME.arch].filter(
        (part): part is string => part != null && part.length > 0
    );
    if (platform.length > 0) {
        userAgent += ` (${platform.join("; ")})`;
    }

    const runtimeName = RUNTIME_DISPLAY_NAMES[RUNTIME.type];
    if (runtimeName != null) {
        userAgent += ` ${runtimeName}`;
        if (RUNTIME.version != null && RUNTIME.version.length > 0) {
            userAgent += `/${RUNTIME.version}`;
        }
    }

    return userAgent;
}
