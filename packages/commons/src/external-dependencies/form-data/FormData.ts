import { ts } from "ts-morph";

export interface FormData {
    _instantiate: () => ts.NewExpression;
    append: (args: { referencetoFormData: ts.Expression; key: string; value: FormDataValue }) => ts.Statement;
}

export interface FormDataValue {
    expression: ts.Expression;
    nullCheck?: {
        // defaults to expression
        expressionToCheck: ts.Expression | undefined;
    };
}
