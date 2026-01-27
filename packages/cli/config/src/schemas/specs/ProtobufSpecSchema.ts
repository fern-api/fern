import { z } from "zod";

export const ProtobufSettingsSchema = z.object({
    // TODO: Add Protobuf-specific settings here.
});

export type ProtobufSettingsSchema = z.infer<typeof ProtobufSettingsSchema>;

export const ProtobufDefinitionSchema = z.object({
    root: z.string(),
    target: z.string().optional(),
    overrides: z.string().optional(),
    localGeneration: z.boolean().optional(),
    fromOpenapi: z.boolean().optional(),
    dependencies: z.array(z.string()).optional()
});

export type ProtobufDefinitionSchema = z.infer<typeof ProtobufDefinitionSchema>;

export const ProtobufSpecSchema = z.object({
    proto: ProtobufDefinitionSchema,
    settings: ProtobufSettingsSchema.optional()
});

export type ProtobufSpecSchema = z.infer<typeof ProtobufSpecSchema>;
