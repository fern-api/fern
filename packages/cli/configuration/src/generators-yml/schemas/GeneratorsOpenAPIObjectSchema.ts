import { z } from "zod";
import { APIDefinitionSettingsSchema } from "./APIConfigurationSchema";

export const OPENAPI_DISABLE_EXAMPLES_KEY = "disable-examples";

export const GeneratorsOpenAPIObjectSchema = z.strictObject({
    path: z.string(),
    origin: z.optional(z.string()),
    overrides: z.optional(z.string()),
    [OPENAPI_DISABLE_EXAMPLES_KEY]: z.optional(z.boolean()),
    settings: APIDefinitionSettingsSchema
});

export type GeneratorsOpenAPIObjectSchema = z.infer<typeof GeneratorsOpenAPIObjectSchema>;
