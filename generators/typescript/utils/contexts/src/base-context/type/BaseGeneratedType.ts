import { ExampleTypeShape } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons";
import { GeneratedModule } from "../../commons/GeneratedModule";
import { GeneratedStatements } from "../../commons/GeneratedStatements";
import { GeneratedUnionInlineMemberNode } from "../../commons/GeneratedUnionInlineMemberNode";
import { RecursionGuard } from "@fern-typescript/type-reference-example-generator";

export interface BaseGeneratedType<Context>
    extends GeneratedFile<Context>,
        GeneratedStatements<Context>,
        GeneratedModule<Context>,
        GeneratedUnionInlineMemberNode<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts, recursionGuard?: RecursionGuard) => ts.Expression;
}
