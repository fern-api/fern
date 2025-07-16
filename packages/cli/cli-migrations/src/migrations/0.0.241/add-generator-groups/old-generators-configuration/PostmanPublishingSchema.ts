import { z } from "zod";

export const PostmanPublishingSchema = z.strictObject({
    postman: z.strictObject({
        "api-key": z.string(),
        "workspace-id": z.string()
    })
});

export type PostmanPublishingSchema = z.infer<typeof PostmanPublishingSchema>;
