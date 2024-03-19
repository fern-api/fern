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
 * NavigationSchema is a recursive schema that can be either a record, a list of records, or a list of strings
 * where the strings are SDK method names and the records are groups of methods or subpackages keyed by the SDK group name.
 */
// Define a type that represents either a string or a record
export type NavigationItem = string | NavigationGroupSchema;

// Define your 'NavigationGroupSchema' as a record that will hold either a string or another 'NavigationGroupSchema'
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface NavigationGroupSchema {
    [key: string]: NavigationItem | NavigationItem[];
}

// Your 'NavigationSchema' can now hold your recursive `NavigationGroupSchema`
export type NavigationSchema = NavigationItem | NavigationItem[];

export const NavigationGroupSchema: ZodType<NavigationGroupSchema> = z.lazy(() =>
    z.record(z.union([NavigationItem, z.array(NavigationItem)]))
);

export const NavigationItem = z.union([z.string(), NavigationGroupSchema]);

export const NavigationSchema = z.union([NavigationItem, z.array(NavigationGroupSchema)]);

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

export type APIDefinitionSchema = z.infer<typeof APIDefinitionSchema>;

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
