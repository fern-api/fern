import { ExampleTypeShape } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedFile } from "../../commons/GeneratedFile";
import { GeneratedStatements } from "../../commons/GeneratedStatements";
import { GeneratedUnionInlineMemberNode } from "../../commons/GeneratedUnionInlineMemberNode";

export interface BaseGeneratedType<Context>
    extends GeneratedFile<Context>,
        GeneratedStatements<Context>,
        GeneratedUnionInlineMemberNode<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
