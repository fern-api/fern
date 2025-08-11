import {
    ClassInstantiation,
    ClassReference,
    Class_,
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

export {
    ClassInstantiation,
    ClassReference,
    Class_,
    CodeBlock,
    KeywordArgument,
    Method,
    MethodInvocation,
    Module_,
    Parameter,
    TypeLiteral,
    TypeParameter,
    Type
} from "./ast";
export { AstNode } from "./ast/core/AstNode";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
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
