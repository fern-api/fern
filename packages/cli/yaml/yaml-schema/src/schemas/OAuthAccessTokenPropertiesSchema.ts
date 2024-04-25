import { z } from "zod";

export const OAuthAccessTokenPropertiesSchema = z.strictObject({
    "access-token": z.string(),
    "expires-in": z.optional(z.string()),
    "refresh-token": z.optional(z.string())
});

export type OAuthAccessTokenPropertiesSchema = z.infer<typeof OAuthAccessTokenPropertiesSchema>;
