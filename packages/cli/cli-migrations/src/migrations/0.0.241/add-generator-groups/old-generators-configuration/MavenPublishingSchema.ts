import { z } from "zod";

import { MavenRegistryOutputSchema } from "./MavenRegistryOutputSchema";

export const MavenPublishingSchema: z.ZodObject<
    {
        maven: z.ZodObject<
            {
                url: z.ZodOptional<z.ZodString>;
                coordinate: z.ZodString;
                username: z.ZodOptional<z.ZodString>;
                password: z.ZodOptional<z.ZodString>;
            },
            "strict",
            z.ZodTypeAny,
            {
                coordinate: string;
                url?: string | undefined;
                username?: string | undefined;
                password?: string | undefined;
            },
            {
                coordinate: string;
                url?: string | undefined;
                username?: string | undefined;
                password?: string | undefined;
            }
        >;
    },
    "strict",
    z.ZodTypeAny,
    {
        maven: {
            coordinate: string;
            url?: string | undefined;
            username?: string | undefined;
            password?: string | undefined;
        };
    },
    {
        maven: {
            coordinate: string;
            url?: string | undefined;
            username?: string | undefined;
            password?: string | undefined;
        };
    }
> = z.strictObject({
    maven: MavenRegistryOutputSchema
});

export type MavenPublishingSchema = z.infer<typeof MavenPublishingSchema>;
