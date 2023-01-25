import { ts } from "ts-morph";
import { GeneratedFile } from "../commons/GeneratedFile";
import { SdkClientClassContext } from "./SdkClientClassContext";

export interface GeneratedSdkClientClass extends GeneratedFile<SdkClientClassContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
}
