import { BasicAuthScheme } from "@fern-fern/ir-sdk/api";
import { getPropertyKey } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance";

export class BasicAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: BasicAuthScheme;

    constructor(authScheme: BasicAuthScheme) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: SdkContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/BasicAuthProvider", {
            namedImports: ["BasicAuthProvider"]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier("BasicAuthProvider"), undefined, params);
    }

    public getSnippetProperties(_context: SdkContext): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(this.authScheme.username.camelCase.safeName),
                ts.factory.createStringLiteral(`YOUR_${this.authScheme.username.screamingSnakeCase.unsafeName}`)
            ),
            ts.factory.createPropertyAssignment(
                getPropertyKey(this.authScheme.password.camelCase.safeName),
                ts.factory.createStringLiteral(`YOUR_${this.authScheme.password.screamingSnakeCase.unsafeName}`)
            )
        ];
    }
}
