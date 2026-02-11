import { z } from "zod";

import { LocalFileSystemOutputLocationSchema } from "./LocalFileSystemOutputLocationSchema";
import { MavenOutputLocationSchema } from "./MavenOutputLocationSchema";
import { NpmOutputLocationSchema } from "./NpmOutputLocationSchema";
import { PostmanOutputLocationSchema } from "./PostmanOutputLocationSchema";

export const GeneratorOutputSchema: z.ZodDiscriminatedUnion<
    "location",
    [
        z.ZodObject<
            {
                location: z.ZodLiteral<"npm">;
                url: z.ZodOptional<z.ZodString>;
                "package-name": z.ZodString;
                token: z.ZodOptional<z.ZodString>;
            },
            "strict",
            z.ZodTypeAny,
            { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined },
            { location: "npm"; "package-name": string; url?: string | undefined; token?: string | undefined }
        >,
        z.ZodObject<
            {
                location: z.ZodLiteral<"maven">;
                url: z.ZodOptional<z.ZodString>;
                coordinate: z.ZodString;
                username: z.ZodOptional<z.ZodString>;
                password: z.ZodOptional<z.ZodString>;
            },
            "strict",
            z.ZodTypeAny,
            {
                location: "maven";
                coordinate: string;
                url?: string | undefined;
                username?: string | undefined;
                password?: string | undefined;
            },
            {
                location: "maven";
                coordinate: string;
                url?: string | undefined;
                username?: string | undefined;
                password?: string | undefined;
            }
        >,
        z.ZodObject<
            { location: z.ZodLiteral<"postman">; "api-key": z.ZodString; "workspace-id": z.ZodString },
            "strict",
            z.ZodTypeAny,
            { location: "postman"; "api-key": string; "workspace-id": string },
            { location: "postman"; "api-key": string; "workspace-id": string }
        >,
        z.ZodObject<
            { location: z.ZodLiteral<"local-file-system">; path: z.ZodString },
            "strict",
            z.ZodTypeAny,
            { path: string; location: "local-file-system" },
            { path: string; location: "local-file-system" }
        >
    ]
> = z.discriminatedUnion("location", [
    NpmOutputLocationSchema,
    MavenOutputLocationSchema,
    PostmanOutputLocationSchema,
    LocalFileSystemOutputLocationSchema
]);

export type GeneratorOutputSchema = z.infer<typeof GeneratorOutputSchema>;
