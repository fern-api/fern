import { z } from "zod";

// This should mirror `OAuthRefreshTokenRequestPropertiesSchema`
const RefreshTokenEndpointRequestSchema = z.object({
    refreshToken: z.string()
});

// This should mirror `OAuthAccessTokenResponsePropertiesSchema`
const EndpointResponseSchema = z.object({
    accessToken: z.string(),
    expiresIn: z.optional(z.string()),
    refreshToken: z.optional(z.string())
});

// This should mirror `OAuthRefreshTokenEndpointSchema`
export const RefreshTokenEndpointSchema = z.object({
    request: RefreshTokenEndpointRequestSchema,
    response: EndpointResponseSchema.extend({
        // Make this field required for the refresh token endpoint
        refreshToken: z.string()
    })
});

export type RefreshTokenEndpointSchema = z.infer<typeof RefreshTokenEndpointSchema>;

// This should mirror `OAuthAccessTokenRequestPropertiesSchema`
const AccessTokenEndpointRequestSchema = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    scopes: z.optional(z.string())
});

// This should mirror `OAuthGetTokenEndpointSchema`
export const AccessTokenEndpointSchema = z.object({
    request: AccessTokenEndpointRequestSchema,
    response: EndpointResponseSchema
});

export type AccessTokenEndpointSchema = z.infer<typeof AccessTokenEndpointSchema>;

const ParameterSchema = z.object({
    name: z.string(),
    env: z.optional(z.string())
});

export const FullOAuthConfigSchema = z.object({
    flow: z.literal("client-credentials"),
    clientId: ParameterSchema,
    clientSecret: ParameterSchema,
    tokenPrefix: z.optional(z.string()),
    getToken: AccessTokenEndpointSchema.extend({
        endpoint: z.string()
    }),
    refreshToken: z.optional(
        RefreshTokenEndpointSchema.extend({
            endpoint: z.string()
        })
    ),
    scopes: z.optional(z.array(z.string()))
});

export type FullOAuthConfigSchema = z.infer<typeof FullOAuthConfigSchema>;
