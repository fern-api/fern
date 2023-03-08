import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";
import { FormData, FormDataValue } from "./FormData";

export class FormDataImpl extends ExternalDependency implements FormData {
    protected override PACKAGE = { name: "form-data", version: "4.0.0" };
    protected override TYPES_PACKAGE = undefined;

    public readonly _instantiate = this.withDefaultImport("FormData", (withImport, FormData) =>
        withImport(() => {
            return ts.factory.createNewExpression(ts.factory.createIdentifier(FormData), undefined, undefined);
        })
    );

    public readonly append = ({
        referencetoFormData,
        key,
        value,
    }: {
        referencetoFormData: ts.Expression;
        key: string;
        value: FormDataValue;
    }): ts.Statement => {
        let statement: ts.Statement = ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("append")),
                undefined,
                [ts.factory.createStringLiteral(key), value.expression]
            )
        );

        if (value.isNullable) {
            statement = ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    value.expression,
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock([statement], true)
            );
        }

        return statement;
    };
}
