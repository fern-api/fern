import { z } from "zod";

export const ModelCustomConfigSchema: z.ZodObject<
    { propertyAccess: z.ZodOptional<z.ZodEnum<["public", "private"]>>; namespace: z.ZodOptional<z.ZodString> },
    "strict",
    z.ZodTypeAny,
    { propertyAccess?: "public" | "private" | undefined; namespace?: string | undefined },
    { propertyAccess?: "public" | "private" | undefined; namespace?: string | undefined }
> = z.strictObject({
    propertyAccess: z.enum(["public", "private"]).optional(),
    namespace: z.string().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
