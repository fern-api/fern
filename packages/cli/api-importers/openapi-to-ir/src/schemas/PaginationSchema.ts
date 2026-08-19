import { z } from "zod";

export const CursorPaginationExtensionSchema = z.object({
    cursor: z.string(),
    next_cursor: z.string(),
    results: z.string()
});

export const OffsetPaginationExtensionSchema = z.object({
    offset: z.string(),
    results: z.string(),
    step: z.string().optional(),
    "has-next-page": z.string().optional()
});

export const UriPaginationExtensionSchema = z.object({
    next_uri: z.string(),
    results: z.string()
});

export const PathPaginationExtensionSchema = z.object({
    next_path: z.string(),
    results: z.string()
});

export const PaginationExtensionSchema = z.union([
    z.boolean(),
    CursorPaginationExtensionSchema,
    OffsetPaginationExtensionSchema,
    UriPaginationExtensionSchema,
    PathPaginationExtensionSchema
]);
