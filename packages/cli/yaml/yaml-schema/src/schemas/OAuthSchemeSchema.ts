import { z } from "zod";
import { TypeReferenceSchema } from "./TypeReferenceSchema";

// The base URL and content-type for the endpoints should be defined with the endpoint for simplicity
const BaseOAuthSchema = z.strictObject({
    scheme: z.literal("oauth"),
    scopes: z.optional(z.array(z.string())),
    "token-prefix": z.optional(z.string()),
    "client-id-env": z.optional(z.string()),
    "client-secret-env": z.optional(z.string()),
    "redirect-uri": z.optional(z.string())
});

const OAuthAccessTokenFields = BaseOAuthSchema.extend({
    "access-token": z.string(),
    "expires-in": z.optional(z.number()),
    "refresh-token": z.optional(z.string())
});

const OAuthRefreshTokenFields = BaseOAuthSchema.extend({
    "refresh-token": z.optional(z.string())
});

const OAuthTokenEndpoint = BaseOAuthSchema.extend({
    endpoint: z.string(),
    "response-fields": OAuthAccessTokenFields
});

const OAuthRefreshEndpoint = BaseOAuthSchema.extend({
    endpoint: z.string(),
    "request-fields": OAuthRefreshTokenFields,
    "response-fields": OAuthAccessTokenFields
});

const OAuthClientCredentialsSchema = BaseOAuthSchema.extend({
    type: z.literal("client-credentials"),
    "token-endpoint": OAuthTokenEndpoint,
    "refresh-endpoint": z.optional(OAuthRefreshEndpoint)
});

const OAuthAuthorizationEndpoint = BaseOAuthSchema.extend({
    path: z.string(),
    "query-parameters": z.record(TypeReferenceSchema)
});

const OAuthAuthorizationCodeSchema = BaseOAuthSchema.extend({
    type: z.literal("authorization-code"),
    "authorization-code-env": z.optional(z.string()),
    "token-endpoint": OAuthTokenEndpoint,
    "authorization-endpoint": OAuthAuthorizationEndpoint,
    "refresh-endpoint": z.optional(OAuthRefreshEndpoint)
});

export const OAuthSchemeSchema = z.union([OAuthClientCredentialsSchema, OAuthAuthorizationCodeSchema]);

export type OAuthSchemeSchema = z.infer<typeof OAuthSchemeSchema>;
