import { ts } from "ts-morph";

import { ExternalDependency } from "../ExternalDependency";
import { qs } from "./qs";

export class QsImpl extends ExternalDependency implements qs {
    protected override PACKAGE = { name: "qs" };
    protected override TYPES_PACKAGE = undefined;

    public readonly stringify = this.withNamespaceImport("qs", (withImport, qs) =>
        withImport((reference: ts.Expression) => {
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(qs), "stringify"),
                undefined,
                [
                    reference,
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("arrayFormat"),
                            ts.factory.createStringLiteral("repeat")
                        )
                    ])
                ]
            );
        })
    );
}
