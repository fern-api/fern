import { AbstractFormatter } from "@fern-api/browser-compatible-base-generator";

import { Class } from "./ast/Class.js";
import { AstNode } from "./ast/core/AstNode.js";
import { JavaFile } from "./ast/core/JavaFile.js";
import { ClassInstantiation, ClassReference, CodeBlock, MethodInvocation } from "./ast/index.js";
import { Method } from "./ast/Method.js";
import { Parameter } from "./ast/Parameter.js";
import { BaseJavaCustomConfigSchema } from "./custom-config/BaseJavaCustomConfigSchema.js";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

/**
 * Renders a node separately from the imports it references, the Java analogue of the TypeScript
 * AST's `toStringWithoutImports`. `code` is the node's rendered body with no `package` statement
 * and no `import ...;` block, and `imports` is the rendered import block the body would otherwise
 * need (empty string when none). This lets callers embed an invocation inside code they already
 * own (e.g. a documentation code template) while surfacing the imports the call requires.
 *
 * The node is written into a file at the given `packageName` so imports are computed (and the
 * target package elided) exactly as they would be in a generated file, matching what the full
 * snippet would emit.
 */
export function renderNodeWithoutImports({
    node,
    packageName,
    customConfig,
    formatter
}: {
    node: AstNode;
    packageName: string;
    customConfig: BaseJavaCustomConfigSchema;
    formatter?: AbstractFormatter;
}): { code: string; imports: string } {
    const file = new JavaFile({ packageName, customConfig, formatter });
    node.write(file);
    // The node's body is the writer buffer alone; the package statement and import block are
    // added only by JavaFile's getContent(). Returning the buffer yields just the invocation, and
    // getRenderedImports() surfaces the import block the body references separately.
    return { code: file.buffer.trimEnd(), imports: file.getRenderedImports() };
}

export { AstNode } from "./ast/core/AstNode.js";
export {
    Access,
    type BuilderParameter,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    type ConstructorParameter,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    TypeLiteral,
    Writer
} from "./ast/index.js";
