import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance.js";

export class HeaderAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: FernIr.HeaderAuthScheme;

    constructor(authScheme: FernIr.HeaderAuthScheme) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: FileContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/HeaderAuthProvider", {
            namedImports: ["HeaderAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("HeaderAuthProvider"), undefined, params);
    }

    public getSnippetProperties(context: FileContext): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(context.case.camelSafe(this.authScheme.name)),
                ts.factory.createStringLiteral(`YOUR_${context.case.screamingSnakeUnsafe(this.authScheme.name)}`)
            )
        ];
    }
}
