import { ts } from "ts-morph";
import { SdkClientClassContext } from "../contexts";
import { GeneratedFile } from "./GeneratedFile";

export interface GeneratedSdkClientClass extends GeneratedFile<SdkClientClassContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
}
