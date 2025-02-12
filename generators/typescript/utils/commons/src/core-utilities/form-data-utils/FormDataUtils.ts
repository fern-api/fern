import { ts } from "ts-morph";

export interface FormDataUtils {
    newFormData: () => ts.AwaitExpression;

    append: (args: { referenceToFormData: ts.Expression; key: string; value: ts.Expression }) => ts.Statement;
    appendFile: (args: {
        referenceToFormData: ts.Expression;
        key: string;
        value: ts.Expression;
        filename?: ts.Expression;
    }) => ts.Statement;

    getBody: (args: { referenceToFormData: ts.Expression }) => ts.Expression;
    getHeaders: (args: { referenceToFormData: ts.Expression }) => ts.Expression;
    getRequest: (args: { referenceToFormData: ts.Expression }) => ts.Expression;
    getDuplexSetting: (args: { referenceToFormData: ts.Expression }) => ts.Expression;
}
