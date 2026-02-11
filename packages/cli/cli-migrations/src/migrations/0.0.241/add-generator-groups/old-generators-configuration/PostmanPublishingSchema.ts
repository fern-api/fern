import { z } from "zod";

export const PostmanPublishingSchema: z.ZodObject<
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
> = z.strictObject({
    postman: z.strictObject({
        "api-key": z.string(),
        "workspace-id": z.string()
    })
});

export type PostmanPublishingSchema = z.infer<typeof PostmanPublishingSchema>;
