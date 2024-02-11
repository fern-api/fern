import { ts } from "ts-morph";

export interface FormDataUtils {
    getFormDataContentLength: (args: { referenceToFormData: ts.Expression }) => ts.Expression;
}
