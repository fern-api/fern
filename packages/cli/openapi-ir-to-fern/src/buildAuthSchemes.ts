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
            if (securityScheme.usernameVariableName != null) {
                basicAuthScheme.username = {
                    name: securityScheme.usernameVariableName
                };
            }
            if (securityScheme.passwordVariableName != null) {
                basicAuthScheme.password = {
                    name: securityScheme.passwordVariableName
                };
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
                bearerAuthScheme.token = {
                    name: securityScheme.tokenVariableName
                };
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
                context.builder.addAuthScheme({
                    name: id,
                    schema: {
                        header: securityScheme.headerName,
                        name: securityScheme.headerVariableName ?? "apiKey",
                        type: "string",
                        prefix: securityScheme.prefix ?? undefined
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
                context.builder.addType(RelativeFilePath.of("__packaqe__.yml"), {
                    name: "OauthScope",
                    schema: buildEnumTypeDeclaration(securityScheme.scopesEnum).schema
                });
            }
        }
    }
}
