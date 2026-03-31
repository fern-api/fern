import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedSdkInlinedRequestBodySchema extends GeneratedFile<SdkContext> {
    serializeRequest: (referenceToParsedRequest: ts.Expression, context: SdkContext) => ts.Expression;
}
