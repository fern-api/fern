import { z } from "zod";
import { ReadmeSchema } from "./ReadmeSchema";
import { SdkTargetSchema } from "./SdkTargetSchema";

export const SdksSchema: z.ZodObject<
    {
        autorelease: z.ZodOptional<z.ZodBoolean>;
        defaultGroup: z.ZodOptional<z.ZodString>;
        readme: z.ZodOptional<z.ZodObject<{ defaultEndpoint: z.ZodOptional<z.ZodString> }, z.core.$strip>>;
        targets: z.ZodRecord<
            z.ZodString,
            z.ZodObject<
                {
                    api: z.ZodOptional<z.ZodString>;
                    lang: z.ZodOptional<
                        z.ZodEnum<{
                            csharp: "csharp";
                            go: "go";
                            java: "java";
                            php: "php";
                            python: "python";
                            ruby: "ruby";
                            rust: "rust";
                            swift: "swift";
                            typescript: "typescript";
                        }>
                    >;
                    image: z.ZodOptional<z.ZodString>;
                    version: z.ZodOptional<z.ZodString>;
                    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    publish: z.ZodOptional<
                        z.ZodObject<
                            {
                                npm: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            packageName: z.ZodString;
                                            url: z.ZodOptional<z.ZodString>;
                                            token: z.ZodOptional<z.ZodString>;
                                        },
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
                                                    {
                                                        keyId: z.ZodString;
                                                        password: z.ZodString;
                                                        secretKey: z.ZodString;
                                                    },
                                                    z.core.$strip
                                                >
                                            >;
                                        },
                                        z.core.$strip
                                    >
                                >;
                                nuget: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            packageName: z.ZodString;
                                            url: z.ZodOptional<z.ZodString>;
                                            apiKey: z.ZodOptional<z.ZodString>;
                                        },
                                        z.core.$strip
                                    >
                                >;
                                rubygems: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            packageName: z.ZodString;
                                            url: z.ZodOptional<z.ZodString>;
                                            apiKey: z.ZodOptional<z.ZodString>;
                                        },
                                        z.core.$strip
                                    >
                                >;
                                crates: z.ZodOptional<
                                    z.ZodObject<
                                        {
                                            packageName: z.ZodString;
                                            url: z.ZodOptional<z.ZodString>;
                                            token: z.ZodOptional<z.ZodString>;
                                        },
                                        z.core.$strip
                                    >
                                >;
                            },
                            z.core.$strip
                        >
                    >;
                    output: z.ZodObject<
                        {
                            path: z.ZodOptional<z.ZodString>;
                            git: z.ZodOptional<
                                z.ZodObject<
                                    {
                                        repository: z.ZodString;
                                        mode: z.ZodOptional<z.ZodEnum<{ pr: "pr"; release: "release"; push: "push" }>>;
                                        branch: z.ZodOptional<z.ZodString>;
                                        license: z.ZodOptional<z.ZodString>;
                                        reviewers: z.ZodOptional<
                                            z.ZodObject<
                                                {
                                                    teams: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                                    users: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                                },
                                                z.core.$strip
                                            >
                                        >;
                                    },
                                    z.core.$strip
                                >
                            >;
                        },
                        z.core.$strip
                    >;
                    group: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    metadata: z.ZodOptional<
                        z.ZodObject<
                            {
                                description: z.ZodOptional<z.ZodString>;
                                authors: z.ZodOptional<
                                    z.ZodArray<z.ZodObject<{ name: z.ZodString; email: z.ZodString }, z.core.$strip>>
                                >;
                            },
                            z.core.$strip
                        >
                    >;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
    autorelease: z.boolean().optional(),
    defaultGroup: z.string().optional(),
    readme: ReadmeSchema.optional(),
    targets: z.record(z.string(), SdkTargetSchema)
});

export type SdksSchema = z.infer<typeof SdksSchema>;
