import { z } from "zod";

export const CursorPaginationExtensionSchema: z.ZodObject<
    { cursor: z.ZodString; next_cursor: z.ZodString; results: z.ZodString },
    "strip",
    z.ZodTypeAny,
    { cursor: string; next_cursor: string; results: string },
    { cursor: string; next_cursor: string; results: string }
> = z.object({
    cursor: z.string(),
    next_cursor: z.string(),
    results: z.string()
});

export const OffsetPaginationExtensionSchema: z.ZodObject<
    {
        offset: z.ZodString;
        results: z.ZodString;
        step: z.ZodOptional<z.ZodString>;
        "has-next-page": z.ZodOptional<z.ZodString>;
    },
    "strip",
    z.ZodTypeAny,
    { results: string; offset: string; step?: string | undefined; "has-next-page"?: string | undefined },
    { results: string; offset: string; step?: string | undefined; "has-next-page"?: string | undefined }
> = z.object({
    offset: z.string(),
    results: z.string(),
    step: z.string().optional(),
    "has-next-page": z.string().optional()
});

export const PaginationExtensionSchema: z.ZodUnion<
    [
        z.ZodBoolean,
        z.ZodObject<
            { cursor: z.ZodString; next_cursor: z.ZodString; results: z.ZodString },
            "strip",
            z.ZodTypeAny,
            { cursor: string; next_cursor: string; results: string },
            { cursor: string; next_cursor: string; results: string }
        >,
        z.ZodObject<
            {
                offset: z.ZodString;
                results: z.ZodString;
                step: z.ZodOptional<z.ZodString>;
                "has-next-page": z.ZodOptional<z.ZodString>;
            },
            "strip",
            z.ZodTypeAny,
            { results: string; offset: string; step?: string | undefined; "has-next-page"?: string | undefined },
            { results: string; offset: string; step?: string | undefined; "has-next-page"?: string | undefined }
        >
    ]
> = z.union([z.boolean(), CursorPaginationExtensionSchema, OffsetPaginationExtensionSchema]);
