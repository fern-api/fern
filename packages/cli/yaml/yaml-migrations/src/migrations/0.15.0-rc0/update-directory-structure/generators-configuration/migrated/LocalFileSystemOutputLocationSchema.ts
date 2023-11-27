import { z } from "zod";

export const LocalFileSystemOutputLocationSchema = z.strictObject({
    location: z.literal("local-file-system"),
    path: z.string()
});

export type LocalFileSystemOutputLocationSchema = z.infer<typeof LocalFileSystemOutputLocationSchema>;
