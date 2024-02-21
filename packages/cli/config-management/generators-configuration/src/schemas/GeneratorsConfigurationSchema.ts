import { z } from "zod";
import { GeneratorGroupSchema } from "./GeneratorGroupSchema";
import { WhitelabelConfigurationSchema } from "./WhitelabelConfigurationSchema";

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const OPENAPI_LOCATION_KEY = "openapi";
export const OPENAPI_OVERRIDES_LOCATION_KEY = "openapi-overrides";
export const ASYNC_API_LOCATION_KEY = "async-api";

export const GeneratorsConfigurationSchema = z.strictObject({
    [DEFAULT_GROUP_GENERATORS_CONFIG_KEY]: z.optional(z.string()),
    [OPENAPI_LOCATION_KEY]: z.optional(z.string()),
    [OPENAPI_OVERRIDES_LOCATION_KEY]: z.optional(z.string()),
    [ASYNC_API_LOCATION_KEY]: z.optional(z.string()),
    whitelabel: z.optional(WhitelabelConfigurationSchema),
    groups: z.optional(z.record(GeneratorGroupSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
