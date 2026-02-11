import { z } from "zod";

import { MavenPublishingSchema } from "./MavenPublishingSchema";
import { NpmPublishingSchema } from "./NpmPublishingSchema";
import { PostmanPublishingSchema } from "./PostmanPublishingSchema";

export const GeneratorPublishingSchema: z.ZodUnion<
    [
        z.ZodObject<
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
        >,
        z.ZodObject<
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
        >,
        z.ZodObject<
            {
                postman: z.ZodObject<
                    { "api-key": z.ZodString; "workspace-id": z.ZodString },
                    "strict",
                    z.ZodTypeAny,
                    { "api-key": string; "workspace-id": string },
                    { "api-key": string; "workspace-id": string }
                >;
            },
            "strict",
            z.ZodTypeAny,
            { postman: { "api-key": string; "workspace-id": string } },
            { postman: { "api-key": string; "workspace-id": string } }
        >
    ]
> = z.union([NpmPublishingSchema, MavenPublishingSchema, PostmanPublishingSchema]);

export type GeneratorPublishingSchema = z.infer<typeof GeneratorPublishingSchema>;
