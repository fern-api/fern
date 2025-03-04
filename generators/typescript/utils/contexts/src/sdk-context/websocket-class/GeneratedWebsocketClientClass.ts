import { ts } from "ts-morph";

import { SdkContext } from "..";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface GeneratedWebsocketClientClass extends GeneratedFile<SdkContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
    accessFromRootClient(args: { referenceToRootClient: ts.Expression }): ts.Expression;
}
