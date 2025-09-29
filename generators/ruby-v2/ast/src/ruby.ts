import {
    AstNode,
    Class_,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Comment,
    KeywordArgument,
    KeywordParameter,
    KeywordSplatParameter,
    Method,
    MethodInvocation,
    Module_,
    PositionalArgument,
    PositionalParameter,
    PositionalSplatParameter,
    TypeParameter,
    YieldParameter
} from "./ast";
import { Begin } from "./ast/Begin";
import { IfElse } from "./ast/IfElse";
import { Raise } from "./ast/Raise";

export {
    Class_,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    KeywordArgument,
    KeywordParameter,
    Method,
    MethodInvocation,
    MethodKind,
    Module_,
    Parameter,
    Type,
    TypeLiteral,
    TypeParameter,
    Writer
} from "./ast";
export { AstNode } from "./ast/core/AstNode";
export type { HashEntry } from "./ast/TypeLiteral";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function trueValue(): CodeBlock {
    return codeblock("true");
}

export function falseValue(): CodeBlock {
    return codeblock("false");
}

export function nilValue(): CodeBlock {
    return codeblock("nil");
}

export const parameters = {
    positional(args: PositionalParameter.Args): PositionalParameter {
        return new PositionalParameter(args);
    },

    keyword(args: KeywordParameter.Args): KeywordParameter {
        return new KeywordParameter(args);
    },

    positionalSplat(args: PositionalSplatParameter.Args): PositionalSplatParameter {
        return new PositionalSplatParameter(args);
    },

    keywordSplat(args: KeywordSplatParameter.Args): KeywordSplatParameter {
        return new KeywordSplatParameter(args);
    },

    yield(args: YieldParameter.Args): YieldParameter {
        return new YieldParameter(args);
    }
} as const;

export function class_(args: Class_.Args): Class_ {
    return new Class_(args);
}

export function module(args: Module_.Args): Module_ {
    return new Module_(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function comment(args: Comment.Args): Comment {
    return new Comment(args);
}

export function typeParameter(args: TypeParameter.Args): TypeParameter {
    return new TypeParameter(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function keywordArgument(args: KeywordArgument.Args): KeywordArgument {
    return new KeywordArgument(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function positionalArgument(args: PositionalArgument.Args): PositionalArgument {
    return new PositionalArgument(args);
}

export function ifElse(args: IfElse.Args): IfElse {
    return new IfElse(args);
}

export function begin(args: Begin.Args): Begin {
    return new Begin(args);
}

export function raise(args: Raise.Args): Raise {
    return new Raise(args);
}

export function wrapInModules(node: AstNode, modules: Module_[]): AstNode {
    let topLevelNode: AstNode = node;
    for (const module of modules.toReversed()) {
        module.addStatement(topLevelNode);
        topLevelNode = module;
    }
    return topLevelNode;
}
