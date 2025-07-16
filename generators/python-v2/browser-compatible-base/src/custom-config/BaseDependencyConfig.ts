import { z } from "zod"

export const BaseDependencyConfig = z.object({
    version: z.string(),
    extras: z.array(z.string()).optional()
})

export type BaseDependencyConfig = z.infer<typeof BaseDependencyConfig>
