import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedTimeoutSdkError extends GeneratedFile<SdkContext> {
    build: (context: SdkContext, message: string) => ts.NewExpression;
}
