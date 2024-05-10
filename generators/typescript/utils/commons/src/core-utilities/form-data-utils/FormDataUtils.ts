import { ts } from "ts-morph";

export interface FormDataUtils {
    _instantiate: () => ts.NewExpression;
    append: (args: { referencetoFormData: ts.Expression; key: string; value: ts.Expression }) => ts.Statement;
    getRequest: (args: { referencetoFormData: ts.Expression }) => ts.Statement;
    getBody: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Statement;
    getHeaders: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Statement;
}
