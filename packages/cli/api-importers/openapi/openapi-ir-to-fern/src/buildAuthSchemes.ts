import { RawSchemas } from "@fern-api/fern-definition-schema";
import type { FernDefinition } from "@fern-api/importer-commons";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { getHeaderName } from "./utils/getHeaderName.js";

const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";
const OAUTH_SCOPE_TYPE_NAME = "OauthScope";
const OAUTH_SCOPE_FALLBACK_TYPE_NAME = "OauthAuthorizationScope";

export function buildAuthSchemes(context: OpenApiIrConverterContext): RawSchemas.TypeDeclarationSchema | undefined {
    if (context.authOverrides != null) {
        for (const [name, declaration] of Object.entries(context.authOverrides["auth-schemes"] ?? {})) {
            context.builder.addAuthScheme({
                name,
                schema: declaration
            });
        }
        if (context.authOverrides.auth != null) {
            context.builder.setAuth(context.authOverrides.auth);
        }
        return undefined;
    }

    let setAuth = false;
    let oauthScopeType: RawSchemas.TypeDeclarationSchema | undefined;
    for (const [id, securityScheme] of Object.entries(context.ir.securitySchemes)) {
        if (securityScheme.type === "basic") {
            const basicAuthScheme: RawSchemas.BasicAuthSchemeSchema = {
                scheme: "basic"
            };

            if (securityScheme.usernameVariableName != null) {
                if (basicAuthScheme.username === undefined) {
                    basicAuthScheme.username = {
                        name: securityScheme.usernameVariableName
                    };
                } else {
                    basicAuthScheme.username.name = securityScheme.usernameVariableName;
                }
            }
            if (securityScheme.usernameEnvVar != null) {
                if (basicAuthScheme.username === undefined) {
                    basicAuthScheme.username = {
                        env: securityScheme.usernameEnvVar
                    };
                } else {
                    basicAuthScheme.username.env = securityScheme.usernameEnvVar;
                }
            }
            if (securityScheme.usernamePlaceholder != null) {
                if (basicAuthScheme.username === undefined) {
                    basicAuthScheme.username = {
                        placeholder: securityScheme.usernamePlaceholder
                    };
                } else {
                    basicAuthScheme.username.placeholder = securityScheme.usernamePlaceholder;
                }
            }

            if (securityScheme.passwordVariableName != null) {
                if (basicAuthScheme.password === undefined) {
                    basicAuthScheme.password = {
                        name: securityScheme.passwordVariableName
                    };
                } else {
                    basicAuthScheme.password.name = securityScheme.passwordVariableName;
                }
            }
            if (securityScheme.passwordEnvVar != null) {
                if (basicAuthScheme.password === undefined) {
                    basicAuthScheme.password = {
                        env: securityScheme.passwordEnvVar
                    };
                } else {
                    basicAuthScheme.password.env = securityScheme.passwordEnvVar;
                }
            }
            if (securityScheme.passwordPlaceholder != null) {
                if (basicAuthScheme.password === undefined) {
                    basicAuthScheme.password = {
                        placeholder: securityScheme.passwordPlaceholder
                    };
                } else {
                    basicAuthScheme.password.placeholder = securityScheme.passwordPlaceholder;
                }
            }

            context.builder.addAuthScheme({
                name: id,
                schema: basicAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(id);
                setAuth = true;
            }
        } else if (securityScheme.type === "bearer") {
            const bearerAuthScheme: RawSchemas.AuthSchemeDeclarationSchema = {
                scheme: "bearer"
            };

            if (securityScheme.tokenVariableName != null) {
                if (bearerAuthScheme.token === undefined) {
                    bearerAuthScheme.token = {
                        name: securityScheme.tokenVariableName
                    };
                } else {
                    bearerAuthScheme.token.name = securityScheme.tokenVariableName;
                }
            }
            if (securityScheme.tokenEnvVar != null) {
                if (bearerAuthScheme.token === undefined) {
                    bearerAuthScheme.token = {
                        env: securityScheme.tokenEnvVar
                    };
                } else {
                    bearerAuthScheme.token.env = securityScheme.tokenEnvVar;
                }
            }
            if (securityScheme.tokenPlaceholder != null) {
                if (bearerAuthScheme.token === undefined) {
                    bearerAuthScheme.token = {
                        placeholder: securityScheme.tokenPlaceholder
                    };
                } else {
                    bearerAuthScheme.token.placeholder = securityScheme.tokenPlaceholder;
                }
            }

            context.builder.addAuthScheme({
                name: id,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(id);
                setAuth = true;
            }
        } else if (securityScheme.type === "header") {
            if (!setAuth) {
                const schema: RawSchemas.AuthSchemeDeclarationSchema = {
                    header: securityScheme.headerName,
                    name: securityScheme.headerVariableName ?? "apiKey",
                    type: "string"
                };
                if (securityScheme.headerEnvVar != null) {
                    schema.env = securityScheme.headerEnvVar;
                }
                if (securityScheme.prefix != null) {
                    schema.prefix = securityScheme.prefix;
                }
                if (securityScheme.headerPlaceholder != null) {
                    schema.placeholder = securityScheme.headerPlaceholder;
                }
                context.builder.addAuthScheme({
                    name: id,
                    schema
                });
                context.builder.setAuth(id);
                setAuth = true;
            } else {
                context.builder.addGlobalHeader({
                    name: securityScheme.headerName,
                    schema: {
                        type: "string",
                        name: securityScheme.headerVariableName ?? getHeaderName(securityScheme.headerName),
                        env: securityScheme.headerEnvVar
                    }
                });
            }
        } else if (securityScheme.type === "oauth") {
            const bearerAuthScheme: RawSchemas.AuthSchemeDeclarationSchema = {
                scheme: "bearer"
            };
            context.builder.addAuthScheme({
                name: id,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(id);
                setAuth = true;
            }
            if (securityScheme.scopesEnum != null && securityScheme.scopesEnum.values.length > 0) {
                // Preserve the existing behavior for multiple OAuth schemes: the last non-empty scope enum wins.
                oauthScopeType = buildEnumTypeDeclaration(securityScheme.scopesEnum, 0).schema;
            }
        }
    }
    return oauthScopeType;
}

/**
 * Adds the OAuth scope enum after all other types have been built, so its name can be deconflicted against the
 * declarations that were actually emitted rather than a parallel approximation.
 */
export function addOauthScopeType(definition: FernDefinition, oauthScopeType: RawSchemas.TypeDeclarationSchema): void {
    const existingTypes = definition.packageMarkerFile.types ?? {};
    const oauthScopeTypeName = getOauthScopeTypeName(Object.keys(existingTypes));
    const { types: _, ...packageMarkerFile } = definition.packageMarkerFile;
    definition.packageMarkerFile = {
        types: {
            [oauthScopeTypeName]: oauthScopeType,
            ...existingTypes
        },
        ...packageMarkerFile
    };
}

function getOauthScopeTypeName(typeNames: Iterable<string>): string {
    const occupiedTypeNames = new Set([...typeNames].map((name) => name.toLowerCase()));
    if (!occupiedTypeNames.has(OAUTH_SCOPE_TYPE_NAME.toLowerCase())) {
        return OAUTH_SCOPE_TYPE_NAME;
    }
    if (!occupiedTypeNames.has(OAUTH_SCOPE_FALLBACK_TYPE_NAME.toLowerCase())) {
        return OAUTH_SCOPE_FALLBACK_TYPE_NAME;
    }

    let suffix = 2;
    while (occupiedTypeNames.has(`${OAUTH_SCOPE_FALLBACK_TYPE_NAME}${suffix}`.toLowerCase())) {
        suffix++;
    }
    return `${OAUTH_SCOPE_FALLBACK_TYPE_NAME}${suffix}`;
}
