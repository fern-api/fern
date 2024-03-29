import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GeneratorPublishMetadataSchema = z.strictObject({
    "package-description": z.optional(z.string()),
    email: z.optional(z.string()),
    "reference-url": z.optional(z.string()),
    author: z.optional(z.string()),
    license: z.optional(GithubLicenseSchema)
});

export type GeneratorPublishMetadataSchema = z.infer<typeof GeneratorPublishMetadataSchema>;
