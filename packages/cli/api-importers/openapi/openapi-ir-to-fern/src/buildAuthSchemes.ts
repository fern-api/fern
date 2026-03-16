import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { WebSocketAuthFallback } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { getHeaderName } from "./utils/getHeaderName.js";

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

            applyWebSocketAuthFallback(basicAuthScheme, securityScheme.websocketAuthFallback);

            context.builder.addAuthScheme({
                name: id,
                schema: basicAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(id);
                setAuth = true;
            }
        } else if (securityScheme.type === "bearer") {
            const bearerAuthScheme: RawSchemas.TokenBearerAuthSchema = {
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

            applyWebSocketAuthFallback(bearerAuthScheme, securityScheme.websocketAuthFallback);

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
                const schema: RawSchemas.HeaderAuthSchemeSchema = {
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
                applyWebSocketAuthFallback(schema, securityScheme.websocketAuthFallback);
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
            const bearerAuthScheme: RawSchemas.TokenBearerAuthSchema = {
                scheme: "bearer"
            };
            applyWebSocketAuthFallback(bearerAuthScheme, securityScheme.websocketAuthFallback);
            context.builder.addAuthScheme({
                name: id,
                schema: bearerAuthScheme
            });
            if (!setAuth) {
                context.builder.setAuth(id);
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

function applyWebSocketAuthFallback(
    schema: RawSchemas.TokenBearerAuthSchema | RawSchemas.BasicAuthSchemeSchema | RawSchemas.HeaderAuthSchemeSchema,
    fallback: WebSocketAuthFallback | undefined
): void {
    if (fallback == null) {
        return;
    }
    switch (fallback.type) {
        case "websocketSubprotocol":
            schema["websocket-auth-fallback"] = {
                in: "websocket-subprotocol",
                format: fallback.format
            };
            return;
        case "query":
            schema["websocket-auth-fallback"] = {
                in: "query",
                name: fallback.name
            };
            return;
        default:
            assertNever(fallback);
    }
}
