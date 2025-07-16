import { z } from "zod";

import { GeneratorGroupSchema } from "./GeneratorGroupSchema";

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const OPENAPI_LOCATION_KEY = "openapi";
export const ASYNC_API_LOCATION_KEY = "async-api";

export const GeneratorsConfigurationSchema = z.strictObject({
    [DEFAULT_GROUP_GENERATORS_CONFIG_KEY]: z.optional(z.string()),
    [OPENAPI_LOCATION_KEY]: z.optional(z.string()),
    [ASYNC_API_LOCATION_KEY]: z.optional(z.string()),
    groups: z.optional(z.record(GeneratorGroupSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
