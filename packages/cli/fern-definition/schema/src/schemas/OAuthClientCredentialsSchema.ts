import { z } from "zod";
import { OAuthGetTokenEndpointSchema } from "./OAuthGetTokenEndpointSchema";
import { OAuthRefreshTokenEndpointSchema } from "./OAuthRefreshTokenEndpointSchema";

export const OAuthClientCredentialsSchema = z.strictObject({
    scheme: z.literal("oauth"),
    type: z.literal("client-credentials"),
    scopes: z.optional(z.array(z.string())),
    "client-id-env": z.optional(z.string()),
    "client-secret-env": z.optional(z.string()),
    "token-prefix": z.optional(z.string()),
    "get-token": OAuthGetTokenEndpointSchema,
    "refresh-token": z.optional(OAuthRefreshTokenEndpointSchema)
});

export type OAuthClientCredentialsSchema = z.infer<typeof OAuthClientCredentialsSchema>;
