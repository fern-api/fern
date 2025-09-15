import { ts } from "ts-morph";

export interface GeneratedUnionInlineMemberNode<Context> {
    generateForInlineUnion(context: Context): {
        typeNode: ts.TypeNode;
        requestTypeNode: ts.TypeNode | undefined;
        responseTypeNode: ts.TypeNode | undefined;
    };
}
