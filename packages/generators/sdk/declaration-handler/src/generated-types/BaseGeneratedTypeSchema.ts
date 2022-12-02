import { ts } from "ts-morph";
import { BaseGenerated } from "./BaseGenerated";

export interface BaseGeneratedTypeSchema<Context> extends BaseGenerated<Context> {
    getReferenceToRawShape: (context: Context) => ts.TypeNode;
}
