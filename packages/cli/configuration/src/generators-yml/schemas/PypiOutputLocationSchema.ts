import { z } from "zod";
import { PypiGeneratorMetadataSchema } from "./PypiGeneratorMetadataSchema";

export const PypiOutputLocationSchema = z.strictObject({
    location: z.literal("pypi"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    token: z.optional(z.string()),
    username: z.optional(z.string()),
    password: z.optional(z.string()),
    metadata: z.optional(PypiGeneratorMetadataSchema)
});

export type PypiOutputLocationSchema = z.infer<typeof PypiOutputLocationSchema>;
