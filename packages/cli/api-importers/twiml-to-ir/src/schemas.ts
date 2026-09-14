import { z } from "zod";

export const TwimlVisibilitySchema = z.enum(["public", "internal"]);

export const TwimlTagCasingSchema = z.enum(["upper_camel", "none"]);

export const RawTwimlAttributeSchema = z.strictObject({
    type: z.string(),
    docstring: z.string().optional(),
    library_visibility: TwimlVisibilitySchema.optional()
});

export const RawTwimlBodySchema = z.strictObject({
    type: z.string(),
    docstring: z.string().optional(),
    required: z.boolean().optional()
});

export const RawTwimlTagSchema = z.strictObject({
    class_name: z.string(),
    tag_name: z.string(),
    tag_casing: TwimlTagCasingSchema.optional(),
    docstring: z.string().optional(),
    enums: z.record(z.string(), z.array(z.string())).optional(),
    body: z.record(z.string(), RawTwimlBodySchema).optional(),
    attributes: z.record(z.string(), RawTwimlAttributeSchema).optional(),
    children: z.array(z.string()).optional()
});

export type TwimlVisibility = z.infer<typeof TwimlVisibilitySchema>;
export type TwimlTagCasing = z.infer<typeof TwimlTagCasingSchema>;
export type RawTwimlAttribute = z.infer<typeof RawTwimlAttributeSchema>;
export type RawTwimlBody = z.infer<typeof RawTwimlBodySchema>;
export type RawTwimlTag = z.infer<typeof RawTwimlTagSchema>;
