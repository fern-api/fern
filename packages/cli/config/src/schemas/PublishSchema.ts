import { z } from "zod";
import { CratesPublishSchema } from "./CratesPublishSchema";
import { MavenPublishSchema } from "./MavenPublishSchema";
import { NpmPublishSchema } from "./NpmPublishSchema";
import { NugetPublishSchema } from "./NugetPublishSchema";
import { PypiPublishSchema } from "./PypiPublishSchema";
import { RubygemsPublishSchema } from "./RubygemsPublishSchema";

export const PublishSchema: z.ZodObject<
    {
        npm: z.ZodOptional<
            z.ZodObject<
                { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; token: z.ZodOptional<z.ZodString> },
                z.core.$strip
            >
        >;
        pypi: z.ZodOptional<
            z.ZodObject<
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
            >
        >;
        maven: z.ZodOptional<
            z.ZodObject<
                {
                    coordinate: z.ZodString;
                    url: z.ZodOptional<z.ZodString>;
                    username: z.ZodOptional<z.ZodString>;
                    password: z.ZodOptional<z.ZodString>;
                    signature: z.ZodOptional<
                        z.ZodObject<
                            { keyId: z.ZodString; password: z.ZodString; secretKey: z.ZodString },
                            z.core.$strip
                        >
                    >;
                },
                z.core.$strip
            >
        >;
        nuget: z.ZodOptional<
            z.ZodObject<
                { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; apiKey: z.ZodOptional<z.ZodString> },
                z.core.$strip
            >
        >;
        rubygems: z.ZodOptional<
            z.ZodObject<
                { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; apiKey: z.ZodOptional<z.ZodString> },
                z.core.$strip
            >
        >;
        crates: z.ZodOptional<
            z.ZodObject<
                { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; token: z.ZodOptional<z.ZodString> },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    npm: NpmPublishSchema.optional(),
    pypi: PypiPublishSchema.optional(),
    maven: MavenPublishSchema.optional(),
    nuget: NugetPublishSchema.optional(),
    rubygems: RubygemsPublishSchema.optional(),
    crates: CratesPublishSchema.optional()
});

export type PublishSchema = z.infer<typeof PublishSchema>;
