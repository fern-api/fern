import { z } from "zod";

export const PypiMetadataSchema: z.ZodObject<
    {
        keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
        documentationLink: z.ZodOptional<z.ZodString>;
        homepageLink: z.ZodOptional<z.ZodString>;
    },
    z.core.$strip
> = z.object({
    keywords: z.array(z.string()).optional(),
    documentationLink: z.string().optional(),
    homepageLink: z.string().optional()
});

export type PypiMetadataSchema = z.infer<typeof PypiMetadataSchema>;

export const PypiPublishSchema: z.ZodObject<
    {
        packageName: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        token: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<
            z.ZodObject<
                {
                    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    documentationLink: z.ZodOptional<z.ZodString>;
                    homepageLink: z.ZodOptional<z.ZodString>;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    token: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    metadata: PypiMetadataSchema.optional()
});

export type PypiPublishSchema = z.infer<typeof PypiPublishSchema>;
