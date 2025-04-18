import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile";

export interface BaseGeneratedTypeSchema<Context> extends GeneratedFile<Context> {
    getReferenceToRawShape: (context: Context) => ts.TypeNode;
}
