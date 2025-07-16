import { z } from 'zod'

export const CasingConfigSchema = z.object({
    snake: z.string().optional(),
    camel: z.string().optional(),
    screamingSnake: z.string().optional(),
    pascal: z.string().optional()
})

export const EnumValueConfigSchema = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    casing: CasingConfigSchema.optional()
})

export const FernEnumConfigSchema = z.record(EnumValueConfigSchema)
