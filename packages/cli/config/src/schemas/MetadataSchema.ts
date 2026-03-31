import { z } from "zod";

export const AuthorSchema = z.object({
    name: z.string(),
    email: z.string()
});

export type AuthorSchema = z.infer<typeof AuthorSchema>;

export const MetadataSchema = z.object({
    description: z.string().optional(),
    authors: z.array(AuthorSchema).optional()
});

export type MetadataSchema = z.infer<typeof MetadataSchema>;
