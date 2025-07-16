import { z } from 'zod'

export const SdkCustomConfigSchema = z.object({})

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>
