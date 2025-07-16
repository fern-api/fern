import { APIV1Read } from "@fern-api/fdr-sdk"

/**
 * Converts an array of endpoint path parts into a string.
 * @param path The array of endpoint path parts.
 * @returns The string representation of the endpoint path parts.
 */
export function stringifyEndpointPathPartsWithMethod(
    method: APIV1Read.HttpMethod,
    path: APIV1Read.EndpointPathPart[]
): string {
    return `${method} ${stringifyEndpointPathParts(path)}`
}

/**
 * Converts an array of endpoint path parts into a string.
 * @param path The array of endpoint path parts.
 * @returns The string representation of the endpoint path parts.
 */
export function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return path.map((part) => (part.type === "literal" ? part.value : `{${part.value}}`)).join("")
}

// this is a different version of the function that uses colons instead of curly braces
// however, this should not be used except for maintaining backwards compatibility
export function stringifyEndpointPathParts2(path: APIV1Read.EndpointPathPart[]): string {
    return path.map((part) => (part.type === "literal" ? part.value : `:${part.value}`)).join("")
}
