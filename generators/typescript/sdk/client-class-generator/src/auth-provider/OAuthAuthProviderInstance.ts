import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class OAuthAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/OAuthAuthProvider", {
            namedImports: ["OAuthAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("OAuthAuthProvider"), undefined, params);
    }
}
