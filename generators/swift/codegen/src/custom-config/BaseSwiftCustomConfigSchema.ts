import { z } from 'zod'

export const BaseSwiftCustomConfigSchema = z.object({})

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>
