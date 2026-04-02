import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PostmanHeader, PostmanRequestAuth, PostmanVariable } from "@fern-fern/postman-sdk/api";
import { getReferenceToVariable } from "./utils.js";

const caseConverter = new CaseConverter({ generationLanguage: undefined, keywords: undefined, smartCasing: true });

const BASIC_AUTH_USERNAME_VARIABLE = "username";
const BASIC_AUTH_PASSWORD_VARIABLE = "password";
const BEARER_AUTH_TOKEN_VARIABLE = "token";

export function convertAuth(schemes: FernIr.AuthScheme[]): PostmanRequestAuth | undefined {
    for (const scheme of schemes) {
        const auth = FernIr.AuthScheme._visit<PostmanRequestAuth | undefined>(scheme, {
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
                            value: getWireValue(header.name),
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
            inferred: () => ({
                type: "bearer",
                bearer: [
                    {
                        key: "token",
                        value: getReferenceToVariable(BEARER_AUTH_TOKEN_VARIABLE),
                        type: "string"
                    }
                ]
            }),
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

export function getAuthHeaders(schemes: FernIr.AuthScheme[]): PostmanHeader[] {
    return schemes.flatMap((scheme) =>
        FernIr.AuthScheme._visit<PostmanHeader[]>(scheme, {
            basic: () => [],
            bearer: () => [],
            oauth: () => [],
            header: (header): PostmanHeader[] => [
                {
                    key: getWireValue(header.name),
                    value: getReferenceToVariable(getVariableForAuthHeader(header)),
                    type: "string",
                    description: header.docs ?? undefined
                }
            ],
            inferred: () => [],
            _other: () => {
                throw new Error("Unknown auth scheme: " + scheme.type);
            }
        })
    );
}

export function getVariablesForAuthScheme(scheme: FernIr.AuthScheme): PostmanVariable[] {
    return FernIr.AuthScheme._visit(scheme, {
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
        inferred: () => [
            {
                key: BEARER_AUTH_TOKEN_VARIABLE,
                value: "",
                type: "string"
            }
        ],
        _other: () => {
            throw new Error("Unknown auth scheme: " + scheme.type);
        }
    });
}

function getVariableForAuthHeader(header: FernIr.HeaderAuthScheme): string {
    const nameValue = typeof header.name === "string" ? header.name : header.name.name;
    return caseConverter.camelUnsafe(nameValue);
}
