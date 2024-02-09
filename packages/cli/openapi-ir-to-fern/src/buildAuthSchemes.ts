import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { buildEnumTypeDeclaration } from "./buildTypeDeclaration";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getHeaderName } from "./utils/getHeaderName";

const BASIC_AUTH_SCHEME = "BasicAuthScheme";
const BEARER_AUTH_SCHEME = "BearerAuthScheme";

export function buildAuthSchemes(context: OpenApiIrConverterContext): void {
    let setAuth = false;

    for (const [id, securityScheme] of Object.entries(context.ir.securitySchemes)) {
        if (securityScheme.type === "basic") {
            const basicAuthScheme: RawSchemas.BasicAuthSchemeSchema = {
                scheme: "basic"
            };
            basicAuthScheme.username = {
                name: securityScheme.usernameVariableName ?? undefined,
                env: securityScheme.usernameEnvVar ?? undefined
            };
            basicAuthScheme.password = {
                name: securityScheme.passwordVariableName ?? undefined,
                env: securityScheme.passwordEnvVar ?? undefined
            };

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
            bearerAuthScheme.token = {
                name: securityScheme.tokenVariableName ?? undefined,
                env: securityScheme.tokenEnvVar ?? undefined
            };

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
                context.builder.addAuthScheme({
                    name: id,
                    schema: {
                        header: securityScheme.headerName,
                        name: securityScheme.headerVariableName ?? "apiKey",
                        type: "string",
                        prefix: securityScheme.prefix ?? undefined,
                        env: securityScheme.headerEnvVar ?? undefined
                    }
                });
                context.builder.setAuth(id);
                setAuth = true;
            } else {
                context.builder.addGlobalHeader({
                    name: securityScheme.headerName,
                    schema: {
                        type: "string",
                        name: securityScheme.headerVariableName ?? getHeaderName(securityScheme.headerName)
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
            if (securityScheme.scopesEnum != null) {
                context.builder.addType(RelativeFilePath.of("__package__.yml"), {
                    name: "OauthScope",
                    schema: buildEnumTypeDeclaration(securityScheme.scopesEnum).schema
                });
            }
        }
    }
}
