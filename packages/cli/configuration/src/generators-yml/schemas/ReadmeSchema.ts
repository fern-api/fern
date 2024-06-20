import { z } from "zod";
import { ReadmeEndpointSchema } from "./ReadmeEndpointSchema";

export const ReadmeSchema = z.strictObject({
    bannerLink: z.optional(z.string()),
    introduction: z.optional(z.string()),
    apiReferenceLink: z.optional(z.string()),
    defaultEndpoint: z
        .optional(ReadmeEndpointSchema)
        .describe("If set, use this endpoint's snippet as the default whenever possible"),
    features: z
        .optional(z.record(z.array(ReadmeEndpointSchema)))
        .describe("Specifies a list of endpoints associated with the feature")
});

export type ReadmeSchema = z.infer<typeof ReadmeSchema>;
