import { RUNTIME } from "../runtime";

/**
 * Returns a fetch function based on the runtime
 */
export async function getFetchFn(): Promise<any> {
    // In Node.js 18+ environments, use native fetch
    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
        return fetch;
    }

    // Uncomment this block if you want to support Node.js 16, Node.js 17
    // In Node.js 18 or lower environments, the SDK always uses`node-fetch`.
    if (RUNTIME.type === "node") {
        return (await import("node-fetch")).default as any;
    }

    // Otherwise the SDK uses global fetch if available,
    // and falls back to node-fetch.
    if (typeof fetch == "function") {
        return fetch;
    }

    // Uncomment this block if you want to support Node.js 16, Node.js 17
    // Defaults to node `node-fetch` if global fetch isn't available
    return (await import("node-fetch")).default as any;

    // // Comment this block if you want to support Node.js 16, Node.js 17
    // // Throw error if no fetch on system (Node.js 16, node 17)
    // throw new Error(
    //     "fetch is not available in the current environment. Please contact support@fern.com if this is a blocker."
    // );
}
