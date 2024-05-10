import { ts } from "ts-morph";

export interface FormDataUtils {
    _instantiate: () => ts.NewExpression;
    append: (args: { referencetoFormData: ts.Expression; key: string; value: ts.Expression }) => ts.Statement;
<<<<<<< HEAD
    getRequest: (args: { referencetoFormData: ts.Expression }) => ts.Expression;
    getBody: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Expression;
    getHeaders: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Expression;
=======
    getRequest: (args: { referencetoFormData: ts.Expression }) => ts.Statement;
    getBody: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Statement;
    getHeaders: (args: { referencetoFormDataRequest: ts.Expression }) => ts.Statement;
>>>>>>> c592ccbe7 (move back under fetcher)
}
