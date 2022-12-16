import { AuthScheme } from "@fern-fern/ir-model/auth";
import { HttpHeader } from "@fern-fern/ir-model/services/http";
import { PostmanHeader, PostmanRequestAuth, PostmanVariable } from "@fern-fern/postman-sdk/resources";
import { getReferenceToVariable } from "./utils";

const BASIC_AUTH_USERNAME_VARIABLE = "username";
const BASIC_AUTH_PASSWORD_VARIABLE = "password";
const BEARER_AUTH_TOKEN_VARIABLE = "token";

export function convertAuth(schemes: AuthScheme[]): PostmanRequestAuth | undefined {
    for (const scheme of schemes) {
        const auth = AuthScheme._visit<PostmanRequestAuth | undefined>(scheme, {
            basic: () =>
                PostmanRequestAuth.basic([
                    {
                        key: "username",
                        value: getReferenceToVariable(BASIC_AUTH_USERNAME_VARIABLE),
                        type: "string",
                    },
                    {
                        key: "password",
                        value: getReferenceToVariable(BASIC_AUTH_PASSWORD_VARIABLE),
                        type: "string",
                    },
                ]),
            bearer: () =>
                PostmanRequestAuth.bearer([
                    {
                        key: "token",
                        value: getReferenceToVariable(BEARER_AUTH_TOKEN_VARIABLE),
                        type: "string",
                    },
                ]),
            header: (header) =>
                PostmanRequestAuth.apikey([
                    {
                        key: "value",
                        value: getReferenceToVariable(getVariableForAuthHeader(header)),
                        type: "string",
                    },
                    {
                        key: "key",
                        value: getReferenceToVariable(getVariableForAuthHeader(header)),
                        type: "string",
                    },
                    {
                        key: "in",
                        value: "header",
                        type: "string",
                    },
                ]),
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        });

        if (auth != null) {
            return auth;
        }
    }

    return undefined;
}

export function getAuthHeaders(schemes: AuthScheme[]): PostmanHeader[] {
    return schemes.flatMap((scheme) =>
        AuthScheme._visit(scheme, {
            basic: () => [],
            bearer: () => [],
            header: (header) => [
                {
                    key: header.name.wireValue,
                    value: getReferenceToVariable(getVariableForAuthHeader(header)),
                    type: "string",
                    description: header.docs ?? undefined,
                },
            ],
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        })
    );
}

export function getVariablesForAuthScheme(scheme: AuthScheme): PostmanVariable[] {
    return AuthScheme._visit(scheme, {
        basic: () => [
            {
                key: BASIC_AUTH_USERNAME_VARIABLE,
                value: "",
                type: "string",
            },
            {
                key: BASIC_AUTH_PASSWORD_VARIABLE,
                value: "",
                type: "string",
            },
        ],
        bearer: () => [
            {
                key: BEARER_AUTH_TOKEN_VARIABLE,
                value: "",
                type: "string",
            },
        ],
        header: (header) => [
            {
                key: getVariableForAuthHeader(header),
                value: "",
                type: "string",
            },
        ],
        _unknown: () => {
            throw new Error("Unknown auth scheme: " + scheme._type);
        },
    });
}

function getVariableForAuthHeader(header: HttpHeader): string {
    return header.name.wireValue;
}
