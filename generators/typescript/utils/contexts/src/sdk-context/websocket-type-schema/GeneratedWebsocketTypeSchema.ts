import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedWebsocketTypeSchema extends GeneratedFile<SdkContext> {
    deserializeResponse: (referenceToRawResponse: ts.Expression, context: SdkContext) => ts.Expression;
}
