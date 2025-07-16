import { z } from 'zod'

export const ClientConfig = z.object({
    filename: z.string().optional(),
    class_name: z.string().optional(),
    exported_filename: z.string().optional(),
    exported_class_name: z.string().optional()
})

export type ClientConfig = z.infer<typeof ClientConfig>
