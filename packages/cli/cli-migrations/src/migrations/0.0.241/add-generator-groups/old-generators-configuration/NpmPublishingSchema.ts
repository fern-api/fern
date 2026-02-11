import { z } from "zod";

import { NpmRegistryOutputSchema } from "./NpmRegistryOutputSchema";

export const NpmPublishingSchema: z.ZodObject<
    {
        npm: z.ZodObject<
            { url: z.ZodOptional<z.ZodString>; "package-name": z.ZodString; token: z.ZodOptional<z.ZodString> },
            "strict",
            z.ZodTypeAny,
            { "package-name": string; url?: string | undefined; token?: string | undefined },
            { "package-name": string; url?: string | undefined; token?: string | undefined }
        >;
    },
    "strict",
    z.ZodTypeAny,
    { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } },
    { npm: { "package-name": string; url?: string | undefined; token?: string | undefined } }
> = z.strictObject({
    npm: NpmRegistryOutputSchema
});

export type NpmPublishingSchema = z.infer<typeof NpmPublishingSchema>;
