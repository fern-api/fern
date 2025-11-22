import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class AnyAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/AnyAuthProvider", {
            namedImports: ["AnyAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("AnyAuthProvider"), undefined, params);
    }
}
