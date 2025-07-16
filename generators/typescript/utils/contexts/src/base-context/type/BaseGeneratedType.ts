import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { ExampleTypeShape } from "@fern-fern/ir-sdk/api";

import { GeneratedFile } from "../../commons";
import { GeneratedModule } from "../../commons/GeneratedModule";
import { GeneratedStatements } from "../../commons/GeneratedStatements";
import { GeneratedUnionInlineMemberNode } from "../../commons/GeneratedUnionInlineMemberNode";

export interface BaseGeneratedType<Context>
    extends GeneratedFile<Context>,
        GeneratedStatements<Context>,
        GeneratedModule<Context>,
        GeneratedUnionInlineMemberNode<Context> {
    buildExample: (example: ExampleTypeShape, context: Context, opts: GetReferenceOpts) => ts.Expression;
}
