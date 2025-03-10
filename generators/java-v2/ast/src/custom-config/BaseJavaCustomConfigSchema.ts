import { z } from "zod";

export const BaseJavaCustomConfigSchema = z.object({
    "package-layout": z.enum(["flat", "nested"]).optional()
});

export type BaseJavaCustomConfigSchema = z.infer<typeof BaseJavaCustomConfigSchema>;
