import { z } from "zod";

export const ProjectConfigSchema: z.ZodObject<
    { organization: z.ZodString; version: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { version: string; organization: string },
    { version: string; organization: string }
> = z.strictObject({
    organization: z.string(),
    version: z.string()
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
