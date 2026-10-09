import { describe, expect, it } from "vitest";

import { mapSdkConfigToGeneratorsYml } from "../../mapSdkConfigToGeneratorsYml.js";
import type { SpecFacts } from "../../types.js";
import { cliIr, codes, errorCodes, facts, warningCodes } from "../helpers.js";

const TOKEN_FACTS = facts({
    serverUrls: ["https://api.example.com/v1"],
    postOperations: {
        "/oauth/token": {
            requestProperties: ["client_id", "client_secret", "scope"],
            responseProperties: ["access_token", "expires_in", "refresh_token"]
        },
        "/oauth/refresh": { requestProperties: ["refresh_token"], responseProperties: ["access_token", "expires_in"] }
    }
});

function map(
    scheme: Record<string, unknown>,
    { specFacts = TOKEN_FACTS, api = {} }: { specFacts?: SpecFacts; api?: Record<string, unknown> } = {}
) {
    return mapSdkConfigToGeneratorsYml(cliIr({ api: { ...api, auth: { schemes: [{ id: "oauth", ...scheme }] } } }), {
        configDir: "/work",
        outDir: "/work",
        generatorVersion: "0.49.0",
        specFacts: [specFacts]
    });
}

function entry(result: ReturnType<typeof map>): unknown {
    const schemes = result.generatorsYml["auth-schemes"];
    return typeof schemes === "object" && schemes != null && "oauth" in schemes ? schemes.oauth : undefined;
}

const clientCredentials = (flow: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) => ({
    type: "oauth2",
    flows: [{ type: "client-credentials", tokenUrl: "https://api.example.com/v1/oauth/token", ...flow }],
    ...extra
});

describe("oauth rule", () => {
    it("maps client credentials to scheme oauth, type client-credentials, with client-id-env and client-secret-env", () => {
        const result = map(
            clientCredentials(
                {},
                { clientId: { environmentVariable: "ACME_ID" }, clientSecret: { environmentVariable: "ACME_SECRET" } }
            )
        );
        expect(entry(result)).toMatchObject({
            scheme: "oauth",
            type: "client-credentials",
            "client-id-env": "ACME_ID",
            "client-secret-env": "ACME_SECRET"
        });
    });

    it("matches tokenUrl to a POST operation after stripping a spec server URL with a path", () => {
        expect(entry(map(clientCredentials()))).toMatchObject({ "get-token": { endpoint: "POST /oauth/token" } });
    });

    it("matches tokenUrl after stripping an environment URL", () => {
        const result = map(clientCredentials({ tokenUrl: "https://auth.example.com/base/oauth/token" }), {
            specFacts: { ...TOKEN_FACTS, serverUrls: [] },
            api: { environments: [{ name: "prod", urls: [{ name: "auth", url: "https://auth.example.com/base" }] }] }
        });
        expect(entry(result)).toMatchObject({ "get-token": { endpoint: "POST /oauth/token" } });
    });

    it("matches a relative tokenUrl", () => {
        expect(entry(map(clientCredentials({ tokenUrl: "/oauth/token" })))).toMatchObject({
            "get-token": { endpoint: "POST /oauth/token" }
        });
    });

    it("infers get-token request properties client-id and client-secret by RFC 6749 names", () => {
        expect(entry(map(clientCredentials()))).toMatchObject({
            "get-token": {
                "request-properties": { "client-id": "$request.client_id", "client-secret": "$request.client_secret" }
            }
        });
    });

    it("maps scopes to $request.scopes, or to $request.scope when that is the property name", () => {
        const withScope = map(clientCredentials({ scopes: [{ name: "read" }] }));
        expect(entry(withScope)).toMatchObject({
            scopes: ["read"],
            "get-token": { "request-properties": { scopes: "$request.scope" } }
        });
        const withScopes = map(clientCredentials({ tokenUrl: "/token", scopes: [{ name: "read" }] }), {
            specFacts: facts({
                postOperations: {
                    "/token": { requestProperties: ["scopes"], responseProperties: ["access_token"] }
                }
            })
        });
        expect(entry(withScopes)).toMatchObject({
            "get-token": { "request-properties": { scopes: "$request.scopes" } }
        });
    });

    it("infers response properties access-token, expires-in and refresh-token", () => {
        expect(entry(map(clientCredentials()))).toMatchObject({
            "get-token": {
                "response-properties": {
                    "access-token": "$response.access_token",
                    "expires-in": "$response.expires_in",
                    "refresh-token": "$response.refresh_token"
                }
            }
        });
    });

    it("returns an error when no POST operation matches tokenUrl", () => {
        const result = map(clientCredentials({ tokenUrl: "https://api.example.com/v1/nope" }));
        expect(codes(result.diagnostics)).toContain(
            "error CLI_TARGET_TOKEN_ENDPOINT api.auth.schemes[0].flows[0].tokenUrl"
        );
    });

    it("returns an error when the token operation has no access_token", () => {
        const result = map(clientCredentials({ tokenUrl: "/token" }), {
            specFacts: facts({ postOperations: { "/token": { requestProperties: [], responseProperties: ["token"] } } })
        });
        expect(errorCodes(result.diagnostics)).toEqual(["CLI_TARGET_TOKEN_RESPONSE"]);
    });

    it("returns an error for a second client-credentials flow on one scheme", () => {
        const result = map({
            type: "oauth2",
            flows: [
                { type: "client-credentials", tokenUrl: "/oauth/token" },
                { type: "client-credentials", tokenUrl: "/oauth/token" }
            ]
        });
        expect(codes(result.diagnostics)).toContain(
            "error CLI_TARGET_OAUTH_SECOND_FLOW api.auth.schemes[0].flows[1].type"
        );
    });

    it("maps tokenHeader to token-header and tokenPrefix to token-prefix", () => {
        const result = map(clientCredentials({}, { tokenHeader: "X-Access-Token", tokenPrefix: "Token" }));
        expect(entry(result)).toMatchObject({ "token-header": "X-Access-Token", "token-prefix": "Token" });
    });

    it("maps refreshUrl to refresh-token when a POST operation matches", () => {
        const result = map(clientCredentials({ refreshUrl: "https://api.example.com/v1/oauth/refresh" }));
        expect(entry(result)).toMatchObject({
            "refresh-token": {
                endpoint: "POST /oauth/refresh",
                "request-properties": { "refresh-token": "$request.refresh_token" },
                "response-properties": {
                    "access-token": "$response.access_token",
                    "expires-in": "$response.expires_in"
                }
            }
        });
    });

    it("warns and writes no refresh-token when refreshUrl matches nothing", () => {
        const result = map(clientCredentials({ refreshUrl: "https://api.example.com/v1/nope" }));
        expect(entry(result)).not.toHaveProperty("refresh-token");
        expect(warningCodes(result.diagnostics)).toContain("CLI_TARGET_REFRESH_ENDPOINT");
    });

    it("returns an error for an authorization-code flow, which needs a public client id", () => {
        const result = map({
            type: "oauth2",
            flows: [
                {
                    type: "authorization-code",
                    authorizationUrl: "https://a.test/authorize",
                    tokenUrl: "https://a.test/token",
                    scopes: [{ name: "read" }]
                }
            ]
        });
        expect(codes(result.diagnostics)).toEqual([
            "error CLI_TARGET_PUBLIC_CLIENT_ID api.auth.schemes[0].flows[0].type"
        ]);
        expect(entry(result)).toBeUndefined();
    });

    it("returns an error for implicit and password flows", () => {
        for (const type of ["implicit", "password"]) {
            const flow =
                type === "implicit"
                    ? { type, authorizationUrl: "https://a.test/authorize" }
                    : { type, tokenUrl: "https://a.test/token" };
            const result = map({ type: "oauth2", flows: [flow] });
            expect(errorCodes(result.diagnostics)).toEqual(["CLI_TARGET_OAUTH_FLOW"]);
        }
    });

    it("warns that get-token properties were inferred", () => {
        expect(warningCodes(map(clientCredentials()).diagnostics)).toContain("CLI_TARGET_INFERRED");
    });
});
