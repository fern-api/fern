import { z } from "zod";

import { BaseApiSettingsSchema } from "./BaseApiSettingsSchema";
import { MessageNamingVersionSchema } from "./MessageNamingVersionSchema";

/**
 * AsyncAPI-specific settings that extend the base API settings.
 * All settings use camelCase naming.
 */
export const AsyncApiSettingsSchema: z.ZodObject<
    {
        respectNullableSchemas: z.ZodOptional<z.ZodBoolean>;
        wrapReferencesToNullableInOptional: z.ZodOptional<z.ZodBoolean>;
        coerceOptionalSchemasToNullable: z.ZodOptional<z.ZodBoolean>;
        titleAsSchemaName: z.ZodOptional<z.ZodBoolean>;
        coerceEnumsToLiterals: z.ZodOptional<z.ZodBoolean>;
        optionalAdditionalProperties: z.ZodOptional<z.ZodBoolean>;
        idiomaticRequestNames: z.ZodOptional<z.ZodBoolean>;
        groupEnvironmentsByHost: z.ZodOptional<z.ZodBoolean>;
        removeDiscriminantsFromSchemas: z.ZodOptional<z.ZodEnum<{ always: "always"; never: "never" }>>;
        pathParameterOrder: z.ZodOptional<z.ZodEnum<{ urlOrder: "urlOrder"; specOrder: "specOrder" }>>;
        messageNaming: z.ZodOptional<z.ZodEnum<{ v1: "v1"; v2: "v2" }>>;
    },
    z.core.$strip
> = BaseApiSettingsSchema.extend({
    /** What version of message naming to use for AsyncAPI messages, this will grow over time. Defaults to v1. */
    messageNaming: MessageNamingVersionSchema.optional()
});

export type AsyncApiSettingsSchema = z.infer<typeof AsyncApiSettingsSchema>;
