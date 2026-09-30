import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getSensitiveHeaders, isCredentialHeaderName } from "../getSensitiveHeaders.js";

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });

function nameAndWireValue(wireValue: string): FernIr.NameAndWireValue {
    const name: FernIr.Name = {
        originalName: wireValue,
        camelCase: { unsafeName: wireValue, safeName: wireValue },
        snakeCase: { unsafeName: wireValue, safeName: wireValue },
        screamingSnakeCase: { unsafeName: wireValue, safeName: wireValue },
        pascalCase: { unsafeName: wireValue, safeName: wireValue }
    };
    return { wireValue, name };
}

function objectProperty(wireValue: string): FernIr.ObjectProperty {
    return {
        name: nameAndWireValue(wireValue),
        valueType: STRING_TYPE,
        propertyAccess: undefined,
        availability: undefined,
        docs: undefined,
        defaultValue: undefined,
        v2Examples: undefined,
        xml: undefined
    };
}

function auth(...schemes: FernIr.AuthScheme[]): FernIr.ApiAuth {
    return { requirement: FernIr.AuthSchemesRequirement.Any, schemes, docs: undefined };
}

function httpHeader(wireValue: string): FernIr.HttpHeader {
    return {
        name: nameAndWireValue(wireValue),
        valueType: STRING_TYPE,
        env: undefined,
        clientDefault: undefined,
        defaultValue: undefined,
        availability: undefined,
        docs: undefined,
        v2Examples: undefined
    };
}

function headerScheme(header: string): FernIr.AuthScheme {
    return FernIr.AuthScheme.header({
        key: header,
        playgroundDocs: undefined,
        name: nameAndWireValue(header),
        valueType: STRING_TYPE,
        prefix: undefined,
        headerEnvVar: undefined,
        headerPlaceholder: undefined,
        docs: undefined
    });
}

function oauthClientCredentialsScheme(tokenHeader: string | undefined): FernIr.AuthScheme {
    return FernIr.AuthScheme.oauth({
        key: "oauth",
        playgroundDocs: undefined,
        docs: undefined,
        configuration: FernIr.OAuthConfiguration.clientCredentials({
            clientIdEnvVar: undefined,
            clientSecretEnvVar: undefined,
            tokenPrefix: undefined,
            tokenHeader,
            scopes: undefined,
            tokenEndpoint: {
                endpointReference: {
                    endpointId: "endpoint_auth.getToken",
                    serviceId: "service_auth",
                    subpackageId: undefined
                },
                requestProperties: {
                    clientId: {
                        propertyPath: undefined,
                        property: FernIr.RequestPropertyValue.body(objectProperty("client_id"))
                    },
                    clientSecret: {
                        propertyPath: undefined,
                        property: FernIr.RequestPropertyValue.body(objectProperty("client_secret"))
                    },
                    scopes: undefined,
                    customProperties: undefined
                },
                responseProperties: {
                    accessToken: { propertyPath: undefined, property: objectProperty("access_token") },
                    expiresIn: undefined,
                    refreshToken: undefined
                }
            },
            refreshEndpoint: undefined
        })
    });
}

function inferredScheme(headerNames: string[]): FernIr.AuthScheme {
    return FernIr.AuthScheme.inferred({
        key: "inferred",
        playgroundDocs: undefined,
        docs: undefined,
        tokenEndpoint: {
            endpoint: { endpointId: "endpoint_auth.getToken", serviceId: "service_auth", subpackageId: undefined },
            expiryProperty: undefined,
            authenticatedRequestHeaders: headerNames.map((headerName) => ({
                headerName,
                valuePrefix: undefined,
                responseProperty: { propertyPath: undefined, property: objectProperty("access_token") }
            }))
        }
    });
}

describe("getSensitiveHeaders", () => {
    it("returns the configured header name of a custom header auth scheme", () => {
        expect(getSensitiveHeaders({ auth: auth(headerScheme("PLAID-SECRET")), headers: [] })).toEqual([
            "PLAID-SECRET"
        ]);
    });

    it("returns every auth scheme header, even when the name does not look like a credential", () => {
        expect(
            getSensitiveHeaders({
                auth: auth(headerScheme("X-Partner"), headerScheme("X-Tenant"), inferredScheme(["X-Session"])),
                headers: []
            })
        ).toEqual(["X-Partner", "X-Tenant", "X-Session"]);
    });

    it("returns Authorization for bearer and basic schemes", () => {
        expect(
            getSensitiveHeaders({
                auth: auth(
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        playgroundDocs: undefined,
                        token: nameAndWireValue("token").name,
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        playgroundDocs: undefined,
                        username: nameAndWireValue("username").name,
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: nameAndWireValue("password").name,
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    })
                ),
                headers: []
            })
        ).toEqual(["Authorization"]);
    });

    it("returns the custom token header of an OAuth scheme, defaulting to Authorization", () => {
        expect(
            getSensitiveHeaders({ auth: auth(oauthClientCredentialsScheme("X-Access-Credential")), headers: [] })
        ).toEqual(["X-Access-Credential"]);
        expect(getSensitiveHeaders({ auth: auth(oauthClientCredentialsScheme(undefined)), headers: [] })).toEqual([
            "Authorization"
        ]);
    });

    it("returns credential-carrying global headers and omits ordinary ones", () => {
        expect(
            getSensitiveHeaders({
                auth: auth(headerScheme("PLAID-SECRET")),
                headers: [
                    httpHeader("PLAID-CLIENT-ID"),
                    httpHeader("Plaid-Version"),
                    httpHeader("X-API-Version"),
                    httpHeader("X-Request-Id"),
                    httpHeader("X-Partner-Secret")
                ]
            })
        ).toEqual(["PLAID-SECRET", "PLAID-CLIENT-ID", "X-Partner-Secret"]);
    });

    it("returns nothing when the API has no auth and no credential headers", () => {
        expect(getSensitiveHeaders({ auth: auth(), headers: [httpHeader("X-API-Version")] })).toEqual([]);
    });
});

describe("isCredentialHeaderName", () => {
    it.each([
        "PLAID-SECRET",
        "PLAID-CLIENT-ID",
        "X-Client-Id",
        "X-Access-Key",
        "X-Api-Key",
        "X-Private-Key",
        "X-Session-Id",
        "X-Refresh-Token",
        "X-Auth",
        "X-Credentials",
        "X-Password"
    ])("treats %s as a credential", (headerName) => {
        expect(isCredentialHeaderName(headerName)).toBe(true);
    });

    it.each([
        "Plaid-Version",
        "X-API-Version",
        "Plaid-New-User-API-Enabled",
        "Content-Type",
        "User-Agent",
        "X-Fern-Language",
        "X-Fern-SDK-Version",
        "X-Request-Id",
        "Idempotency-Key",
        "X-Tokenizer-Mode"
    ])("does not treat %s as a credential", (headerName) => {
        expect(isCredentialHeaderName(headerName)).toBe(false);
    });
});
