import { AuthScheme, HeaderAuthScheme } from "@fern-fern/ir-sdk/api";
import { PostmanHeader, PostmanRequestAuth, PostmanVariable } from "@fern-fern/postman-sdk/api";

import { getReferenceToVariable } from "./utils";

const BASIC_AUTH_USERNAME_VARIABLE = "username";
const BASIC_AUTH_PASSWORD_VARIABLE = "password";
const BEARER_AUTH_TOKEN_VARIABLE = "token";

export function convertAuth(schemes: AuthScheme[]): PostmanRequestAuth | undefined {
    for (const scheme of schemes) {
        const auth = AuthScheme._visit<PostmanRequestAuth | undefined>(scheme, {
            basic: () => ({
                type: "basic",
                basic: [
                    {
                        key: "username",
                        value: getReferenceToVariable(BASIC_AUTH_USERNAME_VARIABLE),
                        type: "string"
                    },
                    {
                        key: "password",
                        value: getReferenceToVariable(BASIC_AUTH_PASSWORD_VARIABLE),
                        type: "string"
                    }
                ]
            }),
            bearer: () => ({
                type: "bearer",
                bearer: [
                    {
                        key: "token",
                        value: getReferenceToVariable(BEARER_AUTH_TOKEN_VARIABLE),
                        type: "string"
                    }
                ]
            }),
            oauth: () => ({
                type: "bearer",
                bearer: [
                    {
                        key: "token",
                        value: getReferenceToVariable(BEARER_AUTH_TOKEN_VARIABLE),
                        type: "string"
                    }
                ]
            }),
            header: (header) => {
                return {
                    type: "apikey",
                    apikey: [
                        {
                            key: "value",
                            value: getReferenceToVariable(getVariableForAuthHeader(header)),
                            type: "string"
                        },
                        {
                            key: "key",
                            value: header.name.wireValue,
                            type: "string"
                        },
                        {
                            key: "in",
                            value: "header",
                            type: "string"
                        }
                    ]
                };
            },
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        });

        if (auth != null) {
            return auth;
        }
    }

    return undefined;
}

export function getAuthHeaders(schemes: AuthScheme[]): PostmanHeader[] {
    return schemes.flatMap((scheme) =>
        AuthScheme._visit<PostmanHeader[]>(scheme, {
            basic: () => [],
            bearer: () => [],
            oauth: () => [],
            header: (header): PostmanHeader[] => [
                {
                    key: header.name.wireValue,
                    value: getReferenceToVariable(getVariableForAuthHeader(header)),
                    type: "string",
                    description: header.docs ?? undefined
                }
            ],
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        })
    );
}

export function getVariablesForAuthScheme(scheme: AuthScheme): PostmanVariable[] {
    return AuthScheme._visit(scheme, {
        basic: () => [
            {
                key: BASIC_AUTH_USERNAME_VARIABLE,
                value: "",
                type: "string"
            },
            {
                key: BASIC_AUTH_PASSWORD_VARIABLE,
                value: "",
                type: "string"
            }
        ],
        bearer: () => [
            {
                key: BEARER_AUTH_TOKEN_VARIABLE,
                value: "",
                type: "string"
            }
        ],
        oauth: () => [
            {
                key: BEARER_AUTH_TOKEN_VARIABLE,
                value: "",
                type: "string"
            }
        ],
        header: (header) => [
            {
                key: getVariableForAuthHeader(header),
                value: "",
                type: "string"
            }
        ],
        _other: () => {
            throw new Error("Unknown auth scheme: " + scheme.type);
        }
    });
}

function getVariableForAuthHeader(header: HeaderAuthScheme): string {
    return header.name.name.camelCase.unsafeName;
}
