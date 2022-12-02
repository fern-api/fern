import { ts } from "ts-morph";
import { ServiceContext } from "../contexts";
import { BaseGenerated } from "./BaseGenerated";

export interface GeneratedService extends BaseGenerated<ServiceContext> {
    instantiate: (args: { referenceToClient: ts.Expression; referenceToOptions: ts.Expression }) => ts.Expression;
}
