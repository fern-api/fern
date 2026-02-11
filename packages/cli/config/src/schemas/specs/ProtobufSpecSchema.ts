import { z } from "zod";

export const ProtobufSettingsSchema: z.ZodObject<{}, z.core.$strip> = z.object({
    // TODO: Add Protobuf-specific settings here.
});

export type ProtobufSettingsSchema = z.infer<typeof ProtobufSettingsSchema>;

export const ProtobufDefinitionSchema: z.ZodObject<
    {
        root: z.ZodString;
        target: z.ZodOptional<z.ZodString>;
        overrides: z.ZodOptional<z.ZodString>;
        localGeneration: z.ZodOptional<z.ZodBoolean>;
        fromOpenapi: z.ZodOptional<z.ZodBoolean>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
    },
    z.core.$strip
> = z.object({
    root: z.string(),
    target: z.string().optional(),
    overrides: z.string().optional(),
    localGeneration: z.boolean().optional(),
    fromOpenapi: z.boolean().optional(),
    dependencies: z.array(z.string()).optional()
});

export type ProtobufDefinitionSchema = z.infer<typeof ProtobufDefinitionSchema>;

export const ProtobufSpecSchema: z.ZodObject<
    {
        proto: z.ZodObject<
            {
                root: z.ZodString;
                target: z.ZodOptional<z.ZodString>;
                overrides: z.ZodOptional<z.ZodString>;
                localGeneration: z.ZodOptional<z.ZodBoolean>;
                fromOpenapi: z.ZodOptional<z.ZodBoolean>;
                dependencies: z.ZodOptional<z.ZodArray<z.ZodString>>;
            },
            z.core.$strip
        >;
        settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    },
    z.core.$strip
> = z.object({
    proto: ProtobufDefinitionSchema,
    settings: ProtobufSettingsSchema.optional()
});

export type ProtobufSpecSchema = z.infer<typeof ProtobufSpecSchema>;
