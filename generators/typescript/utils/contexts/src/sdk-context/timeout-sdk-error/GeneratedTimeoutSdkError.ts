import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedTimeoutSdkError extends GeneratedFile<SdkContext> {
    build: (context: SdkContext, message: string) => ts.NewExpression;
}
