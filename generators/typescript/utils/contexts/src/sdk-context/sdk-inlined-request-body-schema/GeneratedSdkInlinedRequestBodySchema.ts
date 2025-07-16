import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedSdkInlinedRequestBodySchema extends GeneratedFile<SdkContext> {
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: SdkContext) => ts.Expression;
}
