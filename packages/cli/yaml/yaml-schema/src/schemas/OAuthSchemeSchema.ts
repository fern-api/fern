import { z } from "zod";

// The base URL and content-type for the endpoints should be defined with the endpoint for simplicity
const BaseOAuthSchema = z.strictObject({
    scheme: z.literal("oauth"),
    scopes: z.optional(z.array(z.string())),
    "token-prefix": z.optional(z.string()),
    "client-id-env": z.optional(z.string()),
    "client-secret-env": z.optional(z.string()),
    "redirect-uri": z.optional(z.string())
});

const OAuthClientCredentialsSchema = BaseOAuthSchema.extend({
    type: z.literal("client-credentials"),
    "token-endpoint": z.string({
        description:
            "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
    }),
    "refresh-endpoint": z.optional(
        z.string({
            description:
                "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
        })
    )
});

const OAuthImplicitSchema = BaseOAuthSchema.extend({
    type: z.literal("implicit"),
    "authorization-code-env": z.optional(z.string()),
    "authorization-endpoint": z.string({
        description:
            "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
    }),
    "refresh-endpoint": z.optional(
        z.string({
            description:
                "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
        })
    )
});

const OAuthPasswordSchema = BaseOAuthSchema.extend({
    type: z.literal("password"),
    "token-endpoint": z.string({
        description:
            "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
    }),
    "refresh-endpoint": z.optional(
        z.string({
            description:
                "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
        })
    )
});

const OAuthAuthorizationCodeSchema = BaseOAuthSchema.extend({
    type: z.literal("authorization-code"),
    "authorization-code-env": z.optional(z.string()),
    "token-endpoint": z.string({
        description:
            "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
    }),
    "authorization-endpoint": z.string({
        description:
            "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
    }),
    "refresh-endpoint": z.optional(
        z.string({
            description:
                "The endpoint used to retrieve the access token to use for the OAuth scheme. Of the form `package/service_name.method_name`"
        })
    )
});

export const OAuthSchemeSchema = z.union([
    OAuthClientCredentialsSchema,
    OAuthAuthorizationCodeSchema,
    OAuthImplicitSchema,
    OAuthPasswordSchema
]);

export type OAuthSchemeSchema = z.infer<typeof OAuthSchemeSchema>;
