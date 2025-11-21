import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class HeaderAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/HeaderAuthProvider", {
            namedImports: ["HeaderAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("HeaderAuthProvider"), undefined, params);
    }
}
