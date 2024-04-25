import { z } from "zod";
import { OAuthAccessTokenPropertiesSchema } from "./OAuthAccessTokenPropertiesSchema";
import { OAuthRefreshTokenPropertiesSchema } from "./OAuthRefreshTokenPropertiesSchema";

export const OAuthRefreshTokenEndpointSchema = z.strictObject({
    endpoint: z.string().describe("The endpoint to refresh the access token, such as 'auth.refresh_token')"),
    "request-properties": OAuthRefreshTokenPropertiesSchema,
    "response-properties": OAuthAccessTokenPropertiesSchema
});

export type OAuthRefreshTokenEndpointSchema = z.infer<typeof OAuthRefreshTokenEndpointSchema>;
