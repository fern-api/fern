import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedSdkErrorSchema extends GeneratedFile<SdkContext> {
    deserializeBody: (context: SdkContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
