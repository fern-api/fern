import { z } from "zod";
import { OAuthAccessTokenRequestPropertiesSchema } from "./OAuthAccessTokenRequestPropertiesSchema";
import { OAuthAccessTokenResponsePropertiesSchema } from "./OAuthAccessTokenResponsePropertiesSchema";

export const OAuthGetTokenEndpointSchema = z.strictObject({
    endpoint: z.string().describe("The endpoint to get the access token, such as 'auth.get_token')"),
    "request-properties": OAuthAccessTokenRequestPropertiesSchema.optional(),
    "response-properties": OAuthAccessTokenResponsePropertiesSchema.optional()
});

export type OAuthGetTokenEndpointSchema = z.infer<typeof OAuthGetTokenEndpointSchema>;
