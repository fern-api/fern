import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedSdkErrorSchema extends GeneratedFile<SdkContext> {
    deserializeBody: (context: SdkContext, args: { referenceToBody: ts.Expression }) => ts.Expression;
}
