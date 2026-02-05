import { HeaderAuthScheme } from "@fern-fern/ir-sdk/api";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class HeaderAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: HeaderAuthScheme;

    constructor(authScheme: HeaderAuthScheme) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/HeaderAuthProvider", {
            namedImports: ["HeaderAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("HeaderAuthProvider"), undefined, params);
    }

    public getSnippetProperties(_context: SdkContext): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(this.authScheme.name.name.camelCase.safeName),
                ts.factory.createStringLiteral(`YOUR_${this.authScheme.name.name.screamingSnakeCase.unsafeName}`)
            )
        ];
    }
}
