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

/**
 * securitySchemes:
 *   Basic:
 *     scheme: http
 *     type: basic
 *     x-fern-username-variable-name: clientId
 *     x-fern-password-variable-name: clientSecret
 */
export const X_FERN_USERNAME_VARIABLE_NAME = "x-fern-username-variable-name";
export const X_FERN_PASSWORD_VARIABLE_NAME = "x-fern-password-variable-name";

export type FernEnumConfig = Record<string, { docs?: string; name?: string }>;
/**
 * The x-fern-enum allows you to specify docs for the enum value.
 * If your enum is not codegen friendly (not alphanumeric), then you can specify a codegen name as well.
 *
 * MyEnum:
 *   enum:
 *     - VARIANT_ONE
 *     - VARIANT_TWO
 *   x-fern-enum:
 *     VARIANT_ONE:
 *       docs: These are docs about the enum
 *       name: ONE
 */
export const X_FERN_ENUM_EXTENSION = "x-fern-enum";
