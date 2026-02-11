import { z } from "zod";

export const LocalFileSystemOutputLocationSchema: z.ZodObject<
    { location: z.ZodLiteral<"local-file-system">; path: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { path: string; location: "local-file-system" },
    { path: string; location: "local-file-system" }
> = z.strictObject({
    location: z.literal("local-file-system"),
    path: z.string()
});

export type LocalFileSystemOutputLocationSchema = z.infer<typeof LocalFileSystemOutputLocationSchema>;
