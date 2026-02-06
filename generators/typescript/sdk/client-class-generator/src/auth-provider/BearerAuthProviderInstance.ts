import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance.js";

export class BearerAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: FernIr.BearerAuthScheme;

    constructor(authScheme: FernIr.BearerAuthScheme) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/BearerAuthProvider", {
            namedImports: ["BearerAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("BearerAuthProvider"), undefined, params);
    }

    public getSnippetProperties(_context: SdkContext): ts.ObjectLiteralElementLike[] {
        const tokenKey = this.authScheme.token.camelCase.safeName;

        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(tokenKey),
                ts.factory.createStringLiteral(`YOUR_${this.authScheme.token.screamingSnakeCase.unsafeName}`)
            )
        ];
    }
}
