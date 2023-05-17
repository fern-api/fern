import { ts } from "ts-morph";
import { ExternalDependency } from "../ExternalDependency";
import { FormData } from "./FormData";

export class FormDataImpl extends ExternalDependency implements FormData {
    protected override PACKAGE = { name: "form-data", version: "4.0.0" };
    protected override TYPES_PACKAGE = undefined;

    public readonly _instantiate = this.withDefaultImport(
        "FormData",
        (withImport, FormData) =>
            withImport(() => {
                return ts.factory.createNewExpression(ts.factory.createIdentifier(FormData), undefined, undefined);
            }),
        { isSynthetic: true }
    );

    public readonly append = ({
        referencetoFormData,
        key,
        value,
    }: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
    }): ts.Statement => {
        return ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(referencetoFormData, ts.factory.createIdentifier("append")),
                undefined,
                [ts.factory.createStringLiteral(key), value]
            )
        );
    };

    public readonly getBoundary = ({ referencetoFormData }: { referencetoFormData: ts.Expression }): ts.Expression => {
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referencetoFormData, "getBoundary"),
            undefined,
            undefined
        );
    };
}
