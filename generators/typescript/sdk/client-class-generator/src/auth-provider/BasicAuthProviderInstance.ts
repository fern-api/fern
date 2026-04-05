import type { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey } from "@fern-typescript/commons";
import type { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import type { AuthProviderInstance } from "./AuthProviderInstance.js";

export class BasicAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: FernIr.BasicAuthScheme;

    constructor(authScheme: FernIr.BasicAuthScheme) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: FileContext; params: ts.Expression[] }): ts.Expression {
        context.importsManager.addImportFromRoot("auth/BasicAuthProvider", {
            namedImports: ["BasicAuthProvider"]
        });

        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("BasicAuthProvider"),
                "createInstance"
            ),
            undefined,
            params
        );
    }

    public getSnippetProperties(context: FileContext): ts.ObjectLiteralElementLike[] {
        const properties: ts.ObjectLiteralElementLike[] = [];
        if (this.authScheme.usernameOmit !== true) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    getPropertyKey(context.case.camelSafe(this.authScheme.username)),
                    ts.factory.createStringLiteral(
                        `YOUR_${context.case.screamingSnakeUnsafe(this.authScheme.username)}`
                    )
                )
            );
        }
        if (this.authScheme.passwordOmit !== true) {
            properties.push(
                ts.factory.createPropertyAssignment(
                    getPropertyKey(context.case.camelSafe(this.authScheme.password)),
                    ts.factory.createStringLiteral(
                        `YOUR_${context.case.screamingSnakeUnsafe(this.authScheme.password)}`
                    )
                )
            );
        }
        return properties;
    }
}
