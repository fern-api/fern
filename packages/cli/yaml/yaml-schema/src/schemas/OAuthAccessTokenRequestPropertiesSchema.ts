import { z } from "zod";

export const OAuthAccessTokenRequestPropertiesSchema = z.strictObject({
    "client-id": z.optional(z.string()).describe("The property name for the client ID."),
    "client-secret": z.optional(z.string()).describe("The property name for the client secret."),
    scopes: z.optional(z.string()).describe("The property name for the scopes.")
});

export type OAuthAccessTokenRequestPropertiesSchema = z.infer<typeof OAuthAccessTokenRequestPropertiesSchema>;
