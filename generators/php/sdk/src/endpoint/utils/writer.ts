import { php } from "@fern-api/php-codegen";
import { AbstractAstNode } from "@fern-api/generator-commons";

export function tryCatch(
    tryBlock: AbstractAstNode,
    catchBlock: AbstractAstNode,
    exceptionReference: php.ClassReference
): php.CodeBlock {
    return php.codeblock((writer) => {
        writer.writeLine("try {");
        writer.indent();
        writer.writeNodeStatement(tryBlock);
        writer.dedent();
        writer.write("} catch (");
        writer.writeNode(exceptionReference);
        writer.writeLine(" $e) {");
        writer.indent();
        writer.writeNodeStatement(catchBlock);
        writer.dedent();
        writer.writeLine("}");
    });
}
