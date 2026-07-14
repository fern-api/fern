import { assertNever } from "@fern-api/core-utils";
import type { OAuthConfig } from "./customConfig.js";
import type { DetectedAuthBinding } from "./detectAuth.js";
import { toEnvVarPrefix } from "./identity.js";

export function detectConfiguredOAuthBindings(args: {
    oauth: OAuthConfig[] | undefined;
    binaryName: string;
    authSchemeNames: Set<string>;
}): DetectedAuthBinding[] {
    return (args.oauth ?? []).map((config) => {
        if (!args.authSchemeNames.has(config.scheme)) {
            throw new Error(
                `OAuth config references auth scheme "${config.scheme}", but that scheme is not present in the Fern IR.`
            );
        }
        switch (config.flow) {
            case "client-credentials":
                return clientCredentialsBinding(config, args.binaryName);
            case "pkce":
                return pkceBinding(config);
            case "device-code":
                return deviceCodeBinding(config);
            default:
                assertNever(config);
        }
    });
}

function clientCredentialsBinding(
    config: Extract<OAuthConfig, { flow: "client-credentials" }>,
    binaryName: string
): DetectedAuthBinding {
    const prefix = toEnvVarPrefix(binaryName);
    const clientIdEnv = config.clientIdEnv ?? `${prefix}_CLIENT_ID`;
    const clientSecretEnv = config.clientSecretEnv ?? `${prefix}_CLIENT_SECRET`;
    let rustCall = `.auth(OAuth2Auth::new(${rustString(config.scheme)})`;
    rustCall += `.token_url(${rustString(config.tokenUrl)})`;
    rustCall += `.client_id_env(${rustString(clientIdEnv)})`;
    rustCall += `.client_secret_env(${rustString(clientSecretEnv)})`;
    if (config.scopes != null && config.scopes.length > 0) {
        rustCall += `.scopes([${config.scopes.map(rustString).join(", ")}])`;
    }
    rustCall += ")";
    return {
        schemeName: config.scheme,
        rustCall,
        placement: "root",
        authTypeImport: "OAuth2Auth",
        envVars: [clientIdEnv, clientSecretEnv],
        kind: "oauth-client-credentials"
    };
}

function pkceBinding(config: Extract<OAuthConfig, { flow: "pkce" }>): DetectedAuthBinding {
    let rustCall = `.login_flow(PkceLoginFlow::new(${rustString(config.scheme)})`;
    rustCall += `.client_id(${rustString(config.clientId)})`;
    rustCall += `.authorization_url(${rustString(config.authorizationUrl)})`;
    rustCall += `.token_url(${rustString(config.tokenUrl)})`;
    if (config.scopes != null && config.scopes.length > 0) {
        rustCall += `.scopes([${config.scopes.map(rustString).join(", ")}])`;
    }
    if (config.redirectPort != null) {
        rustCall += `.redirect_port(${config.redirectPort})`;
    }
    if (config.tokenPasteUrl != null) {
        rustCall += `.token_paste_url(${rustString(config.tokenPasteUrl)})`;
    }
    rustCall += ")";
    return {
        schemeName: config.scheme,
        rustCall,
        placement: "root",
        authTypeImport: "PkceLoginFlow",
        envVars: [],
        kind: "oauth-interactive"
    };
}

function deviceCodeBinding(config: Extract<OAuthConfig, { flow: "device-code" }>): DetectedAuthBinding {
    let rustCall = `.login_flow(DeviceCodeLoginFlow::new(${rustString(config.scheme)})`;
    rustCall += `.client_id(${rustString(config.clientId)})`;
    rustCall += `.device_authorization_url(${rustString(config.deviceAuthorizationUrl)})`;
    rustCall += `.token_url(${rustString(config.tokenUrl)})`;
    if (config.scopes != null && config.scopes.length > 0) {
        rustCall += `.scopes([${config.scopes.map(rustString).join(", ")}])`;
    }
    if (config.tokenPasteUrl != null) {
        rustCall += `.token_paste_url(${rustString(config.tokenPasteUrl)})`;
    }
    rustCall += ")";
    return {
        schemeName: config.scheme,
        rustCall,
        placement: "root",
        authTypeImport: "DeviceCodeLoginFlow",
        envVars: [],
        kind: "oauth-interactive"
    };
}

function rustString(value: string): string {
    return JSON.stringify(value);
}
