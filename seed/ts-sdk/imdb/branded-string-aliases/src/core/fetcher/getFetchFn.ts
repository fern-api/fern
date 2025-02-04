import { Runtime } from "../runtime/runtime";

/**
 * Returns a fetch function based on the runtime
 */
export async function getFetchFn(): Promise<any> {
    if (typeof fetch === "function") {
        return fetch;
    }
    throw new Error("fetch is not available in this runtime");
}
