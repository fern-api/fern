import { ts } from "ts-morph";
import { GeneratedFile } from "./BaseGenerated";

export interface BaseGeneratedTypeSchema<Context> extends GeneratedFile<Context> {
    getReferenceToRawShape: (context: Context) => ts.TypeNode;
}
