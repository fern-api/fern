import { isPlainObject } from "@fern-api/core-utils";
import { type HttpMethod, HttpMethodSchema } from "@fern-api/fdr-sdk/orpc-client";
import axios from "axios";

export interface SdkGenEndpointSnippet {
    path: string;
    method: HttpMethod;
    code: string;
}

/**
 * Parses the snippets file (the format of `documentation/snippets/snippets.json`): endpoint path, then HTTP method, then code. The map sits under
 * `endpoints`, or under `snippets.endpoints` in the shape of core's /snippets response. Entries the docs
 * cannot use (an unknown method or no code) are dropped.
 */
export function parseSdkSnippetsJson(text: string): SdkGenEndpointSnippet[] {
    const root: unknown = JSON.parse(text);
    const nested = isPlainObject(root) && isPlainObject(root.snippets) ? root.snippets.endpoints : undefined;
    const endpoints = isPlainObject(root) ? (root.endpoints ?? nested) : undefined;
    if (!isPlainObject(endpoints)) {
        return [];
    }
    return Object.entries(endpoints).flatMap(([path, byMethod]) =>
        Object.entries(isPlainObject(byMethod) ? byMethod : {}).flatMap(([rawMethod, code]) => {
            const method = HttpMethodSchema.safeParse(rawMethod.toUpperCase());
            return method.success && typeof code === "string" && code.trim() !== ""
                ? [{ path, method: method.data, code }]
                : [];
        })
    );
}

/** Downloads the snippets file sdk-gen saved beside the SDK, from the link the artifact list gives. */
export async function downloadSnippetsJson(snippetsUrl: string): Promise<string> {
    const response = await axios.get<string>(snippetsUrl, { responseType: "text", transformResponse: (data) => data });
    return response.data;
}
