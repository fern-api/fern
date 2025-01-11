import { ts } from "ts-morph";

export interface GeneratedUnionInlineMemberNode<Context> {
    generateForInlineUnion(context: Context): ts.TypeNode;
}
