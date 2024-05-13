import { z } from "zod";

export const OAuthAccessTokenResponsePropertiesSchema = z.strictObject({
    "access-token": z.optional(z.string()).describe("The property name for the access token."),
    "expires-in": z.optional(z.string()).describe("The property name for the expires in property."),
    "refresh-token": z.optional(z.string()).describe("The property name for the refresh token.")
});

export type OAuthAccessTokenResponsePropertiesSchema = z.infer<typeof OAuthAccessTokenResponsePropertiesSchema>;
