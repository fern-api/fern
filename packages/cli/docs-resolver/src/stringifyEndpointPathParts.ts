import { APIV1Read } from "@fern-api/fdr-sdk/dist";

/**
 * Converts an array of endpoint path parts into a string.
 * @param path The array of endpoint path parts.
 * @returns The string representation of the endpoint path parts.
 */
export function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return path.map((part) => (part.type === "literal" ? part.value : `{${part.value}}`)).join("");
}
