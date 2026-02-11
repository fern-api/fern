import { z } from "zod";

export const AuthorSchema: z.ZodObject<{ name: z.ZodString; email: z.ZodString }, z.core.$strip> = z.object({
    name: z.string(),
    email: z.string()
});

export type AuthorSchema = z.infer<typeof AuthorSchema>;

export const MetadataSchema: z.ZodObject<
    {
        description: z.ZodOptional<z.ZodString>;
        authors: z.ZodOptional<z.ZodArray<z.ZodObject<{ name: z.ZodString; email: z.ZodString }, z.core.$strip>>>;
    },
    z.core.$strip
> = z.object({
    description: z.string().optional(),
    authors: z.array(AuthorSchema).optional()
});

export type MetadataSchema = z.infer<typeof MetadataSchema>;
