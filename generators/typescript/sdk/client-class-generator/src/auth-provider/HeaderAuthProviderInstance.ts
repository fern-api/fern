import { FernIr } from "@fern-fern/ir-sdk";
import { getPropertyKey } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AuthProviderInstance } from "./AuthProviderInstance.js";
import { getHeaderAuthProviderClassName } from "./getHeaderAuthProviderClassName.js";

export class HeaderAuthProviderInstance implements AuthProviderInstance {
    private readonly authScheme: FernIr.HeaderAuthScheme;

    constructor(
        private readonly ir: FernIr.IntermediateRepresentation,
        authScheme: FernIr.HeaderAuthScheme
    ) {
        this.authScheme = authScheme;
    }

    public instantiate({ context, params }: { context: FileContext; params: ts.Expression[] }): ts.Expression {
        const className = getHeaderAuthProviderClassName(this.ir, this.authScheme);
        context.importsManager.addImportFromRoot(`auth/${className}`, {
            namedImports: [className]
        });

        return ts.factory.createNewExpression(ts.factory.createIdentifier(className), undefined, params);
    }

    public getSnippetProperties(context: FileContext): ts.ObjectLiteralElementLike[] {
        return [
            ts.factory.createPropertyAssignment(
                getPropertyKey(context.case.camelSafe(this.authScheme.name)),
                ts.factory.createStringLiteral(
                    this.authScheme.headerPlaceholder ??
                        `YOUR_${context.case.screamingSnakeUnsafe(this.authScheme.name)}`
                )
            )
        ];
    }
}
