import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class BasicAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/BasicAuthProvider", {
            namedImports: ["BasicAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("BasicAuthProvider"), undefined, params);
    }
}
