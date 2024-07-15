import { ts } from "ts-morph";

export interface FormDataUtils {
    _instantiate: () => ts.NewExpression;
    append: (args: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
        file?: boolean;
    }) => ts.Statement;
    getRequest: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
    getBody: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Expression;
    getHeaders: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Expression;
}
