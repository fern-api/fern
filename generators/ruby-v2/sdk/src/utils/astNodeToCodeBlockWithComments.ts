import { ruby } from "@fern-api/ruby-ast";

export function astNodeToCodeBlockWithComments(node: ruby.AstNode, comments: string[]): ruby.CodeBlock {
    return ruby.codeblock((writer) => {
        for (const comment of comments) {
            ruby.comment({ docs: comment });
            writer.newLine();
        }
        writer.newLine();
        node.write(writer);
    });
}
