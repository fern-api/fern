import { z } from "zod";

export const PostmanOutputLocationSchema: z.ZodObject<
    { location: z.ZodLiteral<"postman">; "api-key": z.ZodString; "workspace-id": z.ZodString },
    "strict",
    z.ZodTypeAny,
    { location: "postman"; "api-key": string; "workspace-id": string },
    { location: "postman"; "api-key": string; "workspace-id": string }
> = z.strictObject({
    location: z.literal("postman"),
    "api-key": z.string(),
    "workspace-id": z.string()
});

export type PostmanOutputLocationSchema = z.infer<typeof PostmanOutputLocationSchema>;
