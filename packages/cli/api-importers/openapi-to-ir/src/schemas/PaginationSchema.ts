import { z } from 'zod'

export const CursorPaginationExtensionSchema = z.object({
    cursor: z.string(),
    next_cursor: z.string(),
    results: z.string()
})

export const OffsetPaginationExtensionSchema = z.object({
    offset: z.string(),
    results: z.string(),
    step: z.string().optional(),
    'has-next-page': z.string().optional()
})

export const PaginationExtensionSchema = z.union([
    z.boolean(),
    CursorPaginationExtensionSchema,
    OffsetPaginationExtensionSchema
])
