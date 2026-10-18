import { AbstractFormatter } from "@fern-api/browser-compatible-base-generator";
import { AstNode } from "./ast/core/AstNode.js";
import { GoFile } from "./ast/core/GoFile.js";
import {
    Alias,
    CodeBlock,
    Enum,
    Field,
    File,
    Func,
    FuncInvocation,
    GoTypeReference,
    Identifier,
    Method,
    MethodInvocation,
    Parameter,
    Pointer,
    Selector,
    Struct,
    Switch,
    TypeDeclaration
} from "./ast/index.js";
import { BaseGoCustomConfigSchema } from "./custom-config/BaseGoCustomConfigSchema.js";

export function alias(args: Alias.Args): Alias {
    return new Alias(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function file(args: File.Args = {}): File {
    return new File(args);
}

export function func(args: Func.Args): Func {
    return new Func(args);
}

export function identifier(args: Identifier.Args): Identifier {
    return new Identifier(args);
}

export function invokeFunc(args: FuncInvocation.Args): FuncInvocation {
    return new FuncInvocation(args);
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

export function pointer(args: Pointer.Args): Pointer {
    return new Pointer(args);
}

export function selector(args: Selector.Args): Selector {
    return new Selector(args);
}

export function struct(args: Struct.Args = {}): Struct {
    return new Struct(args);
}

export function switch_(args: Switch.Args): Switch {
    return new Switch(args);
}

export function typeDeclaration(args: TypeDeclaration.Args): TypeDeclaration {
    return new TypeDeclaration(args);
}

export function typeReference(args: GoTypeReference.Args): GoTypeReference {
    return new GoTypeReference(args);
}

/**
 * Renders a node separately from the imports it references, the Go analogue of separating a
 * node's body from its `import (...)` block. `code` is the node's rendered body with no package
 * statement and no import block, and `imports` is the rendered import block the body would
 * otherwise need (empty string when none). This lets callers embed an invocation inside code
 * they already own (e.g. a documentation code template) while surfacing the imports the call
 * requires.
 *
 * The node is written into a file at the given `importPath` so imports are computed (and the
 * target package elided) exactly as they would be in a generated file at that path, matching
 * what the full snippet would emit.
 */
export function renderNodeWithoutImports({
    node,
    packageName,
    rootImportPath,
    importPath,
    customConfig,
    formatter
}: {
    node: AstNode;
    packageName: string;
    rootImportPath: string;
    importPath: string;
    customConfig: BaseGoCustomConfigSchema;
    formatter?: AbstractFormatter;
}): { code: string; imports: string } {
    const file = new GoFile({ packageName, rootImportPath, importPath, customConfig, formatter });
    node.write(file);
    // The node's body is the writer buffer alone; the package statement and import block are
    // added only by GoFile.getContent(). Returning the buffer yields just the invocation, and
    // getImports() surfaces the import block the body references separately.
    return { code: file.buffer.trimEnd(), imports: file.getImports() };
}

export { AstNode } from "./ast/core/AstNode.js";
export {
    Alias,
    CodeBlock,
    Enum,
    Field,
    File,
    Func,
    FuncInvocation,
    GoTypeReference as TypeReference,
    IoReaderTypeReference,
    Method,
    MethodInvocation,
    MultiNode,
    Parameter,
    Pointer,
    Selector,
    Struct,
    type StructField,
    TimeTypeReference,
    Type,
    TypeDeclaration,
    TypeInstantiation,
    UuidTypeReference,
    Writer
} from "./ast/index.js";
