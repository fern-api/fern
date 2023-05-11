/**
 * Used to detect if an endpoint has an async version of it
 * Example usage:
 *   paths:
 *    /path/to/my/endpoint:
 *      x-fern-async-config:
 *        discriminant:
 *          type: header
 *          name: X-Header-Name
 *          value: async
 *        response-status-code: 202
 **/
export const X_FERN_ASYNC_CONFIG = "x-fern-async-config";

/**
 * Used to create veriables in the fern definition
 * Example usage:
 * x-fern-sdk-variables:
 *   appName:
 *     type: string
 * paths:
 *   /path/to/my/endpoint/{id}:
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         x-fern-sdk-variable: appName
 */
export const X_FERN_SDK_VARIABLES = "x-fern-sdk-variables";
export const X_FERN_SDK_VARIABLE = "x-fern-sdk-variable";
