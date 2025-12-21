import { BearerAuthScheme } from "@fern-fern/ir-sdk/api";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class BearerAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: BearerAuthScheme;

    constructor(authScheme: BearerAuthScheme) {
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
