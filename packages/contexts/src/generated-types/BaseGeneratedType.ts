import { ExampleTypeShape } from "@fern-fern/ir-model/types";
import { ts } from "ts-morph";
import { GetReferenceOpts } from "../Reference";
import { GeneratedFile } from "./GeneratedFile";

export interface BaseGeneratedType<Context> extends GeneratedFile<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
