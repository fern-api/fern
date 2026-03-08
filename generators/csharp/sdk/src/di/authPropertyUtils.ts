import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { collectInferredAuthCredentials } from "../utils/inferredAuthUtils.js";

type AuthScheme = FernIr.AuthScheme;
type OAuthScheme = FernIr.OAuthScheme;
type HttpHeader = FernIr.HttpHeader;

/**
 * Represents a configuration property derived from an auth scheme or header
 * that will be included in the generated DI options class and used for
 * constructor argument ordering in the service registration.
 */
export interface AuthProperty {
    name: string;
    pascalName: string;
    docs: string;
    isOptional: boolean;
    hasEnvironmentVariable: boolean;
}

/**
 * Extracts all auth and header properties from the IR for DI generation.
 * This is the single source of truth for property extraction, used by both
 * ServiceCollectionExtensionsGenerator and DependencyInjectionOptionsGenerator.
 *
 * Properties are deduped by name and returned in declaration order:
 * auth scheme properties first, then global headers.
 */
export function extractAuthProperties(context: SdkGeneratorContext): AuthProperty[] {
    const properties: AuthProperty[] = [];
    const seenNames = new Set<string>();

    for (const scheme of context.ir.auth.schemes) {
        for (const prop of extractPropertiesFromAuthScheme(context, scheme)) {
            if (!seenNames.has(prop.name)) {
                properties.push(prop);
                seenNames.add(prop.name);
            }
        }
    }

    // Also include global headers as options properties
    for (const header of context.ir.headers) {
        const prop = extractPropertyFromHeader(header);
        if (prop != null && !seenNames.has(prop.name)) {
            properties.push(prop);
            seenNames.add(prop.name);
        }
    }

    return properties;
}

/**
 * Converts an auth scheme into auth properties.
 * Mirrors the parameter extraction logic in RootClientGenerator.getParameterFromAuthScheme.
 */
function extractPropertiesFromAuthScheme(context: SdkGeneratorContext, scheme: AuthScheme): AuthProperty[] {
    // Note: this mirrors the pre-existing behavior in RootClientGenerator.ts:614 where
    // isOptional = isAuthMandatory (without negation). Both locations use the same
    // inverted logic so constructor argument positions match at runtime.
    const isOptional = context.ir.sdkConfig.isAuthMandatory;

    if (scheme.type === "header") {
        const name = scheme.name.name.camelCase.safeName;
        const pascalName = scheme.name.name.pascalCase.safeName;
        return [
            {
                name,
                pascalName,
                docs: scheme.docs ?? `The ${name} to use for authentication.`,
                isOptional,
                hasEnvironmentVariable: scheme.headerEnvVar != null
            }
        ];
    } else if (scheme.type === "bearer") {
        const name = scheme.token.camelCase.safeName;
        const pascalName = scheme.token.pascalCase.safeName;
        return [
            {
                name,
                pascalName,
                docs: scheme.docs ?? `The ${name} to use for authentication.`,
                isOptional,
                hasEnvironmentVariable: scheme.tokenEnvVar != null
            }
        ];
    } else if (scheme.type === "basic") {
        const usernameName = scheme.username.camelCase.safeName;
        const usernamePascal = scheme.username.pascalCase.safeName;
        const passwordName = scheme.password.camelCase.safeName;
        const passwordPascal = scheme.password.pascalCase.safeName;
        return [
            {
                name: usernameName,
                pascalName: usernamePascal,
                docs: `The ${usernameName} to use for authentication.`,
                isOptional,
                hasEnvironmentVariable: scheme.usernameEnvVar != null
            },
            {
                name: passwordName,
                pascalName: passwordPascal,
                docs: `The ${passwordName} to use for authentication.`,
                isOptional,
                hasEnvironmentVariable: scheme.passwordEnvVar != null
            }
        ];
    } else if (scheme.type === "oauth") {
        const oauth = context.getOauth();
        if (oauth == null) {
            return [];
        }
        const properties: AuthProperty[] = [
            {
                name: "clientId",
                pascalName: "ClientId",
                docs: "The client ID for OAuth authentication.",
                isOptional,
                hasEnvironmentVariable: scheme.configuration.clientIdEnvVar != null
            },
            {
                name: "clientSecret",
                pascalName: "ClientSecret",
                docs: "The client secret for OAuth authentication.",
                isOptional,
                hasEnvironmentVariable: scheme.configuration.clientSecretEnvVar != null
            }
        ];
        // Include additional OAuth parameters (custom properties and scopes)
        properties.push(...extractOAuthAdditionalProperties(context, scheme, isOptional));
        return properties;
    } else if (scheme.type === "inferred") {
        const inferred = context.getInferredAuth();
        if (inferred == null) {
            return [];
        }
        return extractInferredAuthProperties(context, inferred, isOptional);
    }
    return [];
}

/**
 * Gets additional OAuth properties from custom token endpoint properties and scopes.
 * Mirrors the logic in RootClientGenerator.getOAuthAdditionalConstructorParams.
 *
 * Note: hasEnvironmentVariable is false for these properties because the IR's
 * OAuthCustomProperty schema does not include environment variable bindings.
 * Only the top-level clientId/clientSecret have env var support via
 * scheme.configuration.clientIdEnvVar / clientSecretEnvVar.
 */
function extractOAuthAdditionalProperties(
    context: SdkGeneratorContext,
    scheme: OAuthScheme,
    isOptional: boolean
): AuthProperty[] {
    const properties: AuthProperty[] = [];
    for (const customProperty of scheme.configuration.tokenEndpoint.requestProperties.customProperties ?? []) {
        if (isLiteralTypeReference(customProperty.property.valueType)) {
            continue;
        }
        const typeRef = context.csharpTypeMapper.convert({
            reference: customProperty.property.valueType
        });
        if (typeRef.isOptional) {
            continue;
        }
        const name = customProperty.property.name.name.camelCase.safeName;
        const pascalName = customProperty.property.name.name.pascalCase.safeName;
        properties.push({
            name,
            pascalName,
            docs: `The ${name} for OAuth authentication.`,
            isOptional,
            hasEnvironmentVariable: false
        });
    }
    const scopes = scheme.configuration.tokenEndpoint.requestProperties.scopes;
    if (scopes && !isLiteralTypeReference(scopes.property.valueType)) {
        const typeRef = context.csharpTypeMapper.convert({
            reference: scopes.property.valueType
        });
        if (!typeRef.isOptional) {
            const name = scopes.property.name.name.camelCase.safeName;
            const pascalName = scopes.property.name.name.pascalCase.safeName;
            properties.push({
                name,
                pascalName,
                docs: `The ${name} for OAuth authentication.`,
                isOptional,
                hasEnvironmentVariable: false
            });
        }
    }
    return properties;
}

/**
 * Gets properties from inferred auth credentials.
 * Mirrors the logic in RootClientGenerator.getParameterFromAuthScheme for inferred type.
 *
 * Note: hasEnvironmentVariable is false for inferred auth credentials because they
 * are derived from token endpoint headers and body properties, which don't have
 * environment variable bindings in the IR (unlike top-level auth scheme headers
 * which have headerEnvVar/tokenEnvVar). This is consistent with
 * RootClientGenerator which also does not set environmentVariable for inferred params.
 */
function extractInferredAuthProperties(
    context: SdkGeneratorContext,
    inferred: FernIr.InferredAuthScheme,
    isOptional: boolean
): AuthProperty[] {
    const tokenEndpointReference = inferred.tokenEndpoint.endpoint;
    const tokenEndpointHttpService = context.getHttpService(tokenEndpointReference.serviceId);
    if (tokenEndpointHttpService == null) {
        return [];
    }
    const tokenEndpoint = context.resolveEndpoint(tokenEndpointHttpService, tokenEndpointReference.endpointId);
    const credentials = collectInferredAuthCredentials(context, tokenEndpoint);
    return credentials.map((credential) => ({
        name: credential.camelName,
        pascalName: credential.pascalName,
        docs: credential.docs ?? `The ${credential.camelName} for authentication.`,
        isOptional: isOptional || credential.isOptional,
        hasEnvironmentVariable: false
    }));
}

/**
 * Extracts a property from a global header, or returns undefined if the header
 * should be skipped (e.g., literal headers).
 */
function extractPropertyFromHeader(header: HttpHeader): AuthProperty | undefined {
    if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
        return undefined;
    }
    const name = header.name.name.camelCase.safeName;
    const pascalName = header.name.name.pascalCase.safeName;
    return {
        name,
        pascalName,
        docs: header.docs ?? `The ${name} header value.`,
        isOptional: header.valueType.type === "container" && header.valueType.container.type === "optional",
        hasEnvironmentVariable: false
    };
}

function isLiteralTypeReference(typeReference: FernIr.TypeReference): boolean {
    return typeReference.type === "container" && typeReference.container.type === "literal";
}
