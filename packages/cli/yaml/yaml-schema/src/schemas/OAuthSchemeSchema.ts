import { z } from "zod";
import { TypeReferenceSchema } from "./TypeReferenceSchema";

const EndpointReference = z.strictObject({
    path: z.string(),
    method: z.string()
});

// The base URL and content-type for the endpoints should be defined with the endpoint for simplicity
const BaseOAuthSchema = z.strictObject({
    scheme: z.literal("oauth"),
    scopes: z.optional(z.array(z.string())),
    "token-prefix": z.optional(z.string()),
    "client-id-env": z.optional(z.string()),
    "client-secret-env": z.optional(z.string()),
    "redirect-uri": z.optional(z.string())
});

const OAuthAccessTokenFields = z.strictObject({
    "access-token": z.string(),
    "expires-in": z.optional(z.string()),
    "refresh-token": z.optional(z.string())
});

const OAuthRefreshTokenFields = z.strictObject({
    "refresh-token": z.string()
});

const OAuthTokenEndpoint = z.strictObject({
    endpoint: EndpointReference,
    "response-fields": OAuthAccessTokenFields
});

const OAuthRefreshEndpoint = z.strictObject({
    endpoint: EndpointReference,
    "request-fields": OAuthRefreshTokenFields,
    "response-fields": OAuthAccessTokenFields
});

const OAuthAuthorizationEndpoint = z.strictObject({
    path: z.string(),
    "query-parameters": z.record(TypeReferenceSchema)
});

const OAuthClientCredentialsSchema = BaseOAuthSchema.extend({
    type: z.literal("client-credentials"),
    "token-endpoint": OAuthTokenEndpoint,
    "refresh-endpoint": z.optional(OAuthRefreshEndpoint)
});

const OAuthAuthorizationCodeSchema = BaseOAuthSchema.extend({
    type: z.literal("authorization-code"),
    "authorization-code-env": z.optional(z.string()),
    "token-endpoint": OAuthTokenEndpoint,
    "authorization-endpoint": OAuthAuthorizationEndpoint,
    "refresh-endpoint": z.optional(OAuthRefreshEndpoint)
});

export const OAuthSchemeSchema = z.discriminatedUnion("type", [
    OAuthClientCredentialsSchema,
    OAuthAuthorizationCodeSchema
]);

export type OAuthSchemeSchema = z.infer<typeof OAuthSchemeSchema>;
