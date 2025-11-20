import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class BearerAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/BearerAuthProvider", {
            namedImports: ["BearerAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("BearerAuthProvider"), undefined, params);
    }
}
