import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";
import { SdkContext } from "@fern-typescript/contexts";

export class InferredAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/InferredAuthProvider", {
            namedImports: ["InferredAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("InferredAuthProvider"), undefined, params);
    }
}
