import { z } from "zod";

export const ModelCustomConfigSchema = z.strictObject({
    propertyAccess: z.enum(["public", "private"]).optional(),
    namespace: z.string().optional()
});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
