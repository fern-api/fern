import { z } from "zod";
import { OAuthAccessTokenResponsePropertiesSchema } from "./OAuthAccessTokenResponsePropertiesSchema";
import { OAuthRefreshTokenRequestPropertiesSchema } from "./OAuthRefreshTokenRequestPropertiesSchema";

export const OAuthRefreshTokenEndpointSchema = z.strictObject({
    endpoint: z.string().describe("The endpoint to refresh the access token, such as 'auth.refresh_token')"),
    "request-properties": OAuthRefreshTokenRequestPropertiesSchema.optional(),
    "response-properties": OAuthAccessTokenResponsePropertiesSchema.optional()
});
export type OAuthRefreshTokenEndpointSchema = z.infer<typeof OAuthRefreshTokenEndpointSchema>;
