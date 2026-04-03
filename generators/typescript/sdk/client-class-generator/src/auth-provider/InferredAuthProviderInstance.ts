import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance.js";

export class InferredAuthProviderInstance implements AuthProviderInstance {
    public instantiate({ context, params }: { context: FileContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/InferredAuthProvider", {
            namedImports: ["InferredAuthProvider"]
        });

        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("InferredAuthProvider"),
                "createInstance"
            ),
            undefined,
            params
        );
    }

    public getSnippetProperties(_context: FileContext): ts.ObjectLiteralElementLike[] {
        return [];
    }
}
