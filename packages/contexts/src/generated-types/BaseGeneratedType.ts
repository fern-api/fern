import { ExampleTypeShape } from "@fern-fern/ir-model/types";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedFile } from "./GeneratedFile";

export interface BaseGeneratedType<Context> extends GeneratedFile<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
