import { ExampleTypeShape } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedFile } from "../../commons/GeneratedFile";

export interface BaseGeneratedType<Context> extends GeneratedFile<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
