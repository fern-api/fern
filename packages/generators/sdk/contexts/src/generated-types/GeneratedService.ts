import { ts } from "ts-morph";
import { ServiceContext } from "../contexts";
import { GeneratedFile } from "./BaseGenerated";

export interface GeneratedService extends GeneratedFile<ServiceContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
}
