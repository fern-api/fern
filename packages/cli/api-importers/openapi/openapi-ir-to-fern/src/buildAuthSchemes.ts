import { RawSchemas } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration";
import { getHeaderName } from "./utils/getHeaderName";

const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";

export function buildAuthSchemes(context: OpenApiIrConverterContext): void {
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
        return;
    }

    let setAuth = false;

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

            context.builder.addAuthScheme({
                name: BASIC_AUTH_SCHEME,
                schema: basicAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(BASIC_AUTH_SCHEME);
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

            context.builder.addAuthScheme({
                name: BEARER_AUTH_SCHEME,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(BEARER_AUTH_SCHEME);
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
                name: BEARER_AUTH_SCHEME,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(BEARER_AUTH_SCHEME);
                setAuth = true;
            }
            if (securityScheme.scopesEnum != null && securityScheme.scopesEnum.values.length > 0) {
                context.builder.addType(RelativeFilePath.of("__package__.yml"), {
                    name: "OauthScope",
                    schema: buildEnumTypeDeclaration(securityScheme.scopesEnum, 0).schema
                });
            }
        }
    }
}
