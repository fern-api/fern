import { z } from "zod";

export const LibraryInputConfigurationSchema = z.object({
    git: z.string(),
    subpath: z.string().optional()
});

export type LibraryInputConfigurationSchema = z.infer<typeof LibraryInputConfigurationSchema>;

export const LibraryOutputConfigurationSchema = z.object({
    path: z.string()
});

export type LibraryOutputConfigurationSchema = z.infer<typeof LibraryOutputConfigurationSchema>;

export const LibraryConfigurationSchema = z.object({
    input: LibraryInputConfigurationSchema,
    output: LibraryOutputConfigurationSchema,
    lang: z.enum(["python", "typescript", "java", "go", "ruby", "csharp", "php", "swift", "rust"])
});

export type LibraryConfigurationSchema = z.infer<typeof LibraryConfigurationSchema>;
