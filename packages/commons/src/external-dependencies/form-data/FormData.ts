import { ts } from "ts-morph";

export interface FormData {
    _instantiate: () => ts.NewExpression;
    append: (args: { referencetoFormData: ts.Expression; key: string; value: ts.Expression }) => ts.Statement;
    getBoundary: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
}
