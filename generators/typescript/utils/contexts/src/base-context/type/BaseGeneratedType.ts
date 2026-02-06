import { FernIr } from "@fern-fern/ir-sdk";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { GeneratedModule } from "../../commons/GeneratedModule.js";
import { GeneratedStatements } from "../../commons/GeneratedStatements.js";
import { GeneratedUnionInlineMemberNode } from "../../commons/GeneratedUnionInlineMemberNode.js";
import { GeneratedFile } from "../../commons/index.js";

export interface BaseGeneratedType<Context>
    extends GeneratedFile<Context>,
        GeneratedStatements<Context>,
        GeneratedModule<Context>,
        GeneratedUnionInlineMemberNode<Context> {
    buildExample: (example: FernIr.ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
