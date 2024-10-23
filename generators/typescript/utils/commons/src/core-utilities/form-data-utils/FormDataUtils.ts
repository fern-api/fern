import { ts } from "ts-morph";

export interface FormDataUtils {
    newFormData: () => ts.AwaitExpression;

    append: (args: { referencetoFormData: ts.Expression; key: string; value: ts.Expression }) => ts.Statement;
    appendFile: (args: {
        referencetoFormData: ts.Expression;
        key: string;
        value: ts.Expression;
        filename?: ts.Expression;
    }) => ts.Statement;

    getBody: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
    getHeaders: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
    getRequest: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
    getDuplexSetting: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
}
