import { AuthScheme, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AnyAuthV2ProviderGenerator } from "./AnyAuthV2ProviderGenerator";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class AnyAuthV2ProviderInstance implements AuthProviderInstance {
    private readonly ir: IntermediateRepresentation;

    constructor(ir: IntermediateRepresentation) {
        this.ir = ir;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/AnyAuthProvider", {
            namedImports: ["AnyAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("AnyAuthProvider"), undefined, params);
    }

    public getSnippetProperties(context: SdkContext): ts.ObjectLiteralElementLike[] {
        const authSchemes = this.ir.auth.schemes;
        if (authSchemes.length === 0) {
            return [];
        }

        const firstScheme = authSchemes[0];
        if (firstScheme == null) {
            return [];
        }

        const schemeKey = this.getAuthSchemeKey(firstScheme);
        const authObjectProperties: ts.ObjectLiteralElementLike[] = [
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral(schemeKey))
        ];

        switch (firstScheme.type) {
            case "bearer": {
                const tokenKey = firstScheme.token.camelCase.safeName;
                authObjectProperties.push(
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(tokenKey),
                        ts.factory.createStringLiteral(`YOUR_${firstScheme.token.screamingSnakeCase.unsafeName}`)
                    )
                );
                break;
            }
            case "basic": {
                const usernameKey = firstScheme.username.camelCase.safeName;
                const passwordKey = firstScheme.password.camelCase.safeName;
                authObjectProperties.push(
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(usernameKey),
                        ts.factory.createStringLiteral(`YOUR_${firstScheme.username.screamingSnakeCase.unsafeName}`)
                    ),
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(passwordKey),
                        ts.factory.createStringLiteral(`YOUR_${firstScheme.password.screamingSnakeCase.unsafeName}`)
                    )
                );
                break;
            }
            case "header": {
                const headerKey = firstScheme.name.name.camelCase.safeName;
                authObjectProperties.push(
                    ts.factory.createPropertyAssignment(
                        getPropertyKey(headerKey),
                        ts.factory.createStringLiteral(`YOUR_${firstScheme.name.name.screamingSnakeCase.unsafeName}`)
                    )
                );
                break;
            }
            case "oauth": {
                const config = firstScheme.configuration;
                if (config.type === "clientCredentials") {
                    authObjectProperties.push(
                        ts.factory.createPropertyAssignment(
                            "clientId",
                            ts.factory.createStringLiteral("YOUR_CLIENT_ID")
                        ),
                        ts.factory.createPropertyAssignment(
                            "clientSecret",
                            ts.factory.createStringLiteral("YOUR_CLIENT_SECRET")
                        )
                    );
                }
                break;
            }
            case "inferred":
                break;
        }

        return [
            ts.factory.createPropertyAssignment(
                AnyAuthV2ProviderGenerator.AUTH_FIELD_NAME,
                ts.factory.createObjectLiteralExpression(authObjectProperties, false)
            )
        ];
    }

    private getAuthSchemeKey(authScheme: AuthScheme): string {
        switch (authScheme.type) {
            case "bearer":
                return authScheme.key;
            case "basic":
                return authScheme.key;
            case "header":
                return authScheme.key;
            case "oauth":
                return authScheme.key;
            case "inferred":
                return authScheme.key;
            default:
                throw new Error(`Unknown auth scheme type: ${(authScheme as AuthScheme).type}`);
        }
    }
}
