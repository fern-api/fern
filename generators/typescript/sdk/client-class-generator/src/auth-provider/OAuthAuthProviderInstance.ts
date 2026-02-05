import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class OAuthAuthProviderInstance implements AuthProviderInstance {
    private static readonly CLIENT_ID_FIELD_NAME = "clientId";
    private static readonly CLIENT_SECRET_FIELD_NAME = "clientSecret";

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/OAuthAuthProvider", {
            namedImports: ["OAuthAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("OAuthAuthProvider"), undefined, params);
    }

    public getSnippetProperties(context: SdkContext): ts.ObjectLiteralElementLike[] {
        if (!context.generateOAuthClients) {
            return [];
        }

        return [
            ts.factory.createPropertyAssignment(
                OAuthAuthProviderInstance.CLIENT_ID_FIELD_NAME,
                ts.factory.createStringLiteral("YOUR_CLIENT_ID")
            ),
            ts.factory.createPropertyAssignment(
                OAuthAuthProviderInstance.CLIENT_SECRET_FIELD_NAME,
                ts.factory.createStringLiteral("YOUR_CLIENT_SECRET")
            )
        ];
    }
}
