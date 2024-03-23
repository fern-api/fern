import { z } from "zod";
import { APINavigationSchema } from "./APINavigationSchema";

/**
 * @example
 * api: openapi.yml
 *
 * @example
 * api: asyncapi.yml
 */
export const APIDefinitionPathSchema = z.string().describe("Path to the OpenAPI, AsyncAPI or Fern Definition");

/**
 * @example
 * api:
 *  path: openapi.yml
 *  overrides: overrides.yml
 *
 * @example
 * api:
 *  path: asyncapi.yml
 *  overrides: overrides.yml
 */
export const APIDefintionWithOverridesSchema = z.object({
    path: APIDefinitionPathSchema,
    overrides: z.optional(z.string()).describe("Path to the OpenAPI or AsyncAPI overrides")
});

/**
 * @example
 * api:
 *  - path: openapi.yml
 *    overrides: overrides.yml
 *  - openapi.yml
 */
export const APIDefinitionList = z.array(z.union([APIDefinitionPathSchema, APIDefintionWithOverridesSchema]));

/**
 * @example
 * api:
 *  navigation:
 *   groupA: {}
 *   groupB:
 *      - methodA
 *      - methodB
 *      - groupC:
 *          - methodC
 *  definition:
 *   - path: openapi.yml
 *     overrides: overrides.yml
 */
export const APIDefinitionWithSettings = z.object({
    navigation: APINavigationSchema,
    definition: APIDefinitionList
});
export type APIDefinitionWithSettings = z.infer<typeof APIDefinitionWithSettings>;

export function isAPIConfigurationSettingsObject(value: unknown): value is APIDefinitionWithSettings {
    return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value as any as APIDefinitionWithSettings)?.navigation != null ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value as any as APIDefinitionWithSettings)?.definition != null
    );
}

export const APIConfigurationSchema = z.union([
    APIDefinitionPathSchema,
    APIDefintionWithOverridesSchema,
    APIDefinitionList,
    // includes the api definition, navigation and other settings
    APIDefinitionWithSettings
]);

export type APIConfigurationSchema = z.infer<typeof APIConfigurationSchema>;
