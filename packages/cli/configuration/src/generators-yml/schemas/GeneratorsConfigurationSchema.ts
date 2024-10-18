import { RawSchemas } from "@fern-api/fern-definition-schema";
import { z } from "zod";
import { APIConfigurationSchema, APIDefinitionSettingsSchema } from "./APIConfigurationSchema";
import { GeneratorGroupSchema } from "./GeneratorGroupSchema";
import { GeneratorsOpenAPISchema } from "./GeneratorsOpenAPISchema";
import { OutputMetadataSchema } from "./OutputMetadataSchema";
import { ReadmeSchema } from "./ReadmeSchema";
import { ReviewersSchema, REVIEWERS_KEY } from "./ReviewersSchema";
import { WhitelabelConfigurationSchema } from "./WhitelabelConfigurationSchema";

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const OPENAPI_LOCATION_KEY = "openapi";
export const OPENAPI_OVERRIDES_LOCATION_KEY = "openapi-overrides";
export const API_ORIGIN_LOCATION_KEY = "spec-origin";
export const ASYNC_API_LOCATION_KEY = "async-api";
export const API_SETTINGS_KEY = "api-settings";

export const GeneratorsConfigurationSchema = z.strictObject({
    "auth-schemes": z.optional(
        z.record(
            z.custom<RawSchemas.AuthSchemeDeclarationSchema>((val) =>
                RawSchemas.serialization.AuthSchemeDeclarationSchema.parseOrThrow(val)
            )
        )
    ),

    api: z.optional(APIConfigurationSchema),

    whitelabel: z.optional(WhitelabelConfigurationSchema),

    metadata: z.optional(OutputMetadataSchema),

    readme: z.optional(ReadmeSchema),

    [DEFAULT_GROUP_GENERATORS_CONFIG_KEY]: z.optional(z.string()),
    groups: z.optional(z.record(GeneratorGroupSchema)),

    [REVIEWERS_KEY]: z.optional(ReviewersSchema),

    // deprecated, use the `api` key instead
    [OPENAPI_LOCATION_KEY]: z.optional(GeneratorsOpenAPISchema),
    [OPENAPI_OVERRIDES_LOCATION_KEY]: z.optional(z.string()),
    [API_ORIGIN_LOCATION_KEY]: z.optional(z.string()),
    [ASYNC_API_LOCATION_KEY]: z.optional(z.string()),
    [API_SETTINGS_KEY]: z.optional(APIDefinitionSettingsSchema)
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
