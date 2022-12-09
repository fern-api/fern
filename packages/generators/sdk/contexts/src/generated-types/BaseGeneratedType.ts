import { ExampleType } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { GetReferenceOpts } from "../Reference";
import { GeneratedFile } from "./BaseGenerated";

export interface BaseGeneratedType<Context> extends GeneratedFile<Context> {
    buildExample: (example: ExampleType, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
