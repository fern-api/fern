import { z } from "zod";

export const PostmanOutputLocationSchema = z.strictObject({
    location: z.literal("postman"),
    "api-key": z.string(),
    "workspace-id": z.string()
});

export type PostmanOutputLocationSchema = z.infer<typeof PostmanOutputLocationSchema>;
