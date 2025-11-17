import { PathParameter } from "@fern-api/ir-sdk";

/**
 * Orders path parameters to match the order they appear in the URL path.
 * Parameters that are in the URL but not in the parameters array are skipped.
 * Parameters that are in the parameters array but not in the URL are appended at the end.
 *
 * @param urlPath - The URL path (e.g., "/users/{userId}/posts/{postId}")
 * @param parameters - The array of path parameters to order
 * @returns A new array with path parameters ordered to match the URL
 */
export function orderPathParametersByUrl(urlPath: string, parameters: PathParameter[]): PathParameter[] {
    const urlParameterNames = extractParameterNamesFromUrl(urlPath);
    if (urlParameterNames.length === 0) {
        return parameters;
    }

    const parameterMap = new Map<string, PathParameter>();
    for (const param of parameters) {
        parameterMap.set(param.name.originalName, param);
    }

    const ordered: PathParameter[] = [];
    const processedNames = new Set<string>();

    for (const urlParamName of urlParameterNames) {
        const parameter = parameterMap.get(urlParamName);
        if (parameter != null) {
            ordered.push(parameter);
            processedNames.add(urlParamName);
        }
    }

    for (const param of parameters) {
        if (!processedNames.has(param.name.originalName)) {
            ordered.push(param);
        }
    }

    return ordered;
}

/**
 * Extracts parameter names from a URL path string in the order they appear.
 * Handles {param} style parameters.
 *
 * @param urlPath - The URL path (e.g., "/users/{userId}/posts/{postId}")
 * @returns Array of parameter names in order
 */
function extractParameterNamesFromUrl(urlPath: string): string[] {
    const parameterNames: string[] = [];
    const curlyBraceRegex = /{([^}]+)}/g;

    let match: RegExpExecArray | null;
    while ((match = curlyBraceRegex.exec(urlPath)) !== null) {
        if (match[1] != null) {
            parameterNames.push(match[1]);
        }
    }

    return parameterNames;
}
