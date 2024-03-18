import { z, ZodType } from "zod";
import { GeneratorGroupSchema } from "./GeneratorGroupSchema";
import { GeneratorsOpenAPISchema } from "./GeneratorsOpenAPISchema";
import { WhitelabelConfigurationSchema } from "./WhitelabelConfigurationSchema";

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
 * NavigationSchema is a recursive schema that can be either a list of strings, or record of strings to NavigationSchema
 */
export type NavigationSchema = (Record<string, NavigationSchema> | string)[];
export const NavigationSchema: ZodType<NavigationSchema> = z.lazy(() =>
    z.array(z.union([z.string(), z.record(NavigationSchema)]))
);

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
 *  definitions:
 *   - path: openapi.yml
 *     overrides: overrides.yml
 */
export const APIDefinitionListWithNavigation = z.object({
    navigation: NavigationSchema,
    definitions: APIDefinitionList
});

export function isAPIDefinitionListWithNavigation(
    value: unknown
): value is z.infer<typeof APIDefinitionListWithNavigation> {
    return APIDefinitionListWithNavigation.safeParse(value).success;
}

// TODO: Introduce merging configuration with namespaces
export const APIDefinitionSchema = z.union([
    APIDefinitionPathSchema,
    APIDefintionWithOverridesSchema,
    APIDefinitionList,
    APIDefinitionListWithNavigation
]);

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const OPENAPI_LOCATION_KEY = "openapi";
export const OPENAPI_OVERRIDES_LOCATION_KEY = "openapi-overrides";
export const ASYNC_API_LOCATION_KEY = "async-api";

export const GeneratorsConfigurationSchema = z.strictObject({
    api: z.optional(APIDefinitionSchema),

    whitelabel: z.optional(WhitelabelConfigurationSchema),

    [DEFAULT_GROUP_GENERATORS_CONFIG_KEY]: z.optional(z.string()),
    groups: z.optional(z.record(GeneratorGroupSchema)),

    // deprecated, use the `api` key instead
    [OPENAPI_LOCATION_KEY]: z.optional(GeneratorsOpenAPISchema),
    [OPENAPI_OVERRIDES_LOCATION_KEY]: z.optional(z.string()),
    [ASYNC_API_LOCATION_KEY]: z.optional(z.string())
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
