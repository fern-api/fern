import { z } from "zod";

export const BaseCsharpCustomConfigSchema = z.object({
    namespace: z.string().optional()
});

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>;
