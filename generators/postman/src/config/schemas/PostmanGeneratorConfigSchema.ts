import { z } from "zod";

import { PublishConfigSchema } from "./PublishConfigSchema";

export const PostmanGeneratorConfigSchema: z.ZodUnion<
    [
        z.ZodNull,
        z.ZodUndefined,
        z.ZodObject<
            {
                publishing: z.ZodOptional<
                    z.ZodObject<
                        {
                            apiKey: z.ZodString;
                            workspaceId: z.ZodOptional<z.ZodString>;
                            collectionId: z.ZodOptional<z.ZodString>;
                        },
                        "strict",
                        z.ZodTypeAny,
                        { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined },
                        { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined }
                    >
                >;
                filename: z.ZodOptional<z.ZodString>;
                "collection-name": z.ZodOptional<z.ZodString>;
            },
            "strict",
            z.ZodTypeAny,
            {
                publishing?:
                    | { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined }
                    | undefined;
                filename?: string | undefined;
                "collection-name"?: string | undefined;
            },
            {
                publishing?:
                    | { apiKey: string; workspaceId?: string | undefined; collectionId?: string | undefined }
                    | undefined;
                filename?: string | undefined;
                "collection-name"?: string | undefined;
            }
        >
    ]
> = z.union([
    z.null(),
    z.undefined(),
    z.strictObject({
        publishing: PublishConfigSchema.optional(),
        filename: z.string().optional(),
        "collection-name": z.string().optional()
    })
]);

export type PostmanGeneratorConfigSchema = z.infer<typeof PostmanGeneratorConfigSchema>;
