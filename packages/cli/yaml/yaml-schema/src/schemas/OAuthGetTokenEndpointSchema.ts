import { z } from "zod";
import { OAuthAccessTokenPropertiesSchema } from "./OAuthAccessTokenPropertiesSchema";

export const OAuthGetTokenEndpointSchema = z.strictObject({
    endpoint: z.string().describe("The endpoint to get the access token, such as 'auth.get_token')"),
    "response-properties": OAuthAccessTokenPropertiesSchema
});

export type OAuthGetTokenEndpointSchema = z.infer<typeof OAuthGetTokenEndpointSchema>;
