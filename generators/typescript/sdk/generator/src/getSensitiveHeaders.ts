import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

const CREDENTIAL_NAME_TOKENS = new Set([
    "apikey",
    "auth",
    "authentication",
    "authorization",
    "credential",
    "credentials",
    "passwd",
    "password",
    "secret",
    "token"
]);

const CREDENTIAL_NAME_TOKEN_PAIRS = [
    ["access", "key"],
    ["api", "key"],
    ["client", "id"],
    ["private", "key"],
    ["secret", "key"],
    ["session", "id"]
];

/**
 * Returns the names of request headers whose values should be redacted from debug logs:
 * every header an auth scheme writes a credential to, plus global and service headers
 * whose names identify them as credentials (e.g. `X-Partner-Secret`, `PLAID-CLIENT-ID`).
 */
export function getSensitiveHeaders({
    auth,
    headers
}: {
    auth: FernIr.ApiAuth;
    headers: FernIr.HttpHeader[];
}): string[] {
    const authSchemeHeaders = auth.schemes.flatMap(getAuthSchemeHeaders);
    const credentialHeaders = headers
        .map((header) => getWireValue(header.name))
        .filter((headerName) => isCredentialHeaderName(headerName));
    return Array.from(new Set([...authSchemeHeaders, ...credentialHeaders]));
}

function getAuthSchemeHeaders(scheme: FernIr.AuthScheme): string[] {
    switch (scheme.type) {
        case "bearer":
        case "basic":
            return ["Authorization"];
        case "header":
            return [getWireValue(scheme.name)];
        case "oauth":
            return [scheme.configuration.tokenHeader ?? "Authorization"];
        case "inferred":
            return scheme.tokenEndpoint.authenticatedRequestHeaders.map((header) => header.headerName);
        default:
            return [];
    }
}

export function isCredentialHeaderName(headerName: string): boolean {
    const tokens = headerName
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
        .toLowerCase()
        .split(/[^a-z0-9]+/);
    if (tokens.some((token) => CREDENTIAL_NAME_TOKENS.has(token))) {
        return true;
    }
    return CREDENTIAL_NAME_TOKEN_PAIRS.some(([first, second]) =>
        tokens.some((token, index) => token === first && tokens[index + 1] === second)
    );
}
