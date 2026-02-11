import {
    AstNode,
    Attribute,
    Client,
    CodeBlock,
    DocComment,
    Enum,
    EnumVariant,
    Expression,
    Field,
    ImplBlock,
    MatchArm,
    Method,
    Module,
    NewtypeStruct,
    Pattern,
    PrimitiveType,
    PUBLIC,
    Reference,
    StandaloneFunction,
    Statement,
    Struct,
    Type,
    Visibility,
    Writer
} from "./ast";

// Factory functions for Type creation
export function primitiveType(primitive: PrimitiveType): Type {
    return Type.primitive(primitive);
}

export function referenceType(reference: Reference): Type {
    return Type.reference(reference);
}

export function optionType(inner: Type): Type {
    return Type.option(inner);
}

export function resultType(ok: Type, err: Type): Type {
    return Type.result(ok, err);
}

export function vecType(inner: Type): Type {
    return Type.vec(inner);
}

export function hashMapType(key: Type, value: Type): Type {
    return Type.hashMap(key, value);
}

// Factory function for Reference creation
export function reference(args: { name: string; module?: string; genericArgs?: AstNode[] }): Reference {
    return new Reference(args);
}

// Factory functions for new AST nodes
export function attribute(args: Attribute.Args): Attribute {
    return new Attribute(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export function enumVariant(args: EnumVariant.Args): EnumVariant {
    return new EnumVariant(args);
}

export function newtypeStruct(args: NewtypeStruct.Args): NewtypeStruct {
    return new NewtypeStruct(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function standaloneFunction(args: StandaloneFunction.Args): StandaloneFunction {
    return new StandaloneFunction(args);
}

export function implBlock(args: ImplBlock.Args): ImplBlock {
    return new ImplBlock(args);
}

export function module(args: Module.Args): Module {
    return new Module(args);
}

export function client(args: Client.Args): Client {
    return new Client(args);
}

export function docComment(args: DocComment.Args): DocComment {
    return new DocComment(args);
}

// Factory function for Writer creation
export function writer(): Writer {
    return new Writer();
}

// Convenience object for common patterns
export const rust: {
    Type: typeof Type;
    Reference: typeof Reference;
    Attribute: typeof Attribute;
    Field: typeof Field;
    Struct: typeof Struct;
    Enum: typeof Enum;
    EnumVariant: typeof EnumVariant;
    NewtypeStruct: typeof NewtypeStruct;
    Method: typeof Method;
    StandaloneFunction: typeof StandaloneFunction;
    ImplBlock: typeof ImplBlock;
    Module: typeof Module;
    Client: typeof Client;
    DocComment: typeof DocComment;
    Expression: typeof Expression;
    Statement: typeof Statement;
    CodeBlock: typeof CodeBlock;
    Pattern: typeof Pattern;
    MatchArm: typeof MatchArm;
    attribute: typeof attribute;
    field: typeof field;
    struct: typeof struct;
    enum_: typeof enum_;
    enumVariant: typeof enumVariant;
    newtypeStruct: typeof newtypeStruct;
    method: typeof method;
    standaloneFunction: typeof standaloneFunction;
    implBlock: typeof implBlock;
    module: typeof module;
    client: typeof client;
    docComment: typeof docComment;
    writer: typeof writer;
    visibility: {
        public: Visibility;
        private: Visibility;
    };
} = {
    Type: Type,
    Reference: Reference,
    Attribute: Attribute,
    Field: Field,
    Struct: Struct,
    Enum: Enum,
    EnumVariant: EnumVariant,
    NewtypeStruct: NewtypeStruct,
    Method: Method,
    StandaloneFunction: StandaloneFunction,
    ImplBlock: ImplBlock,
    Module: Module,
    Client: Client,
    DocComment: DocComment,
    Expression: Expression,
    Statement: Statement,
    CodeBlock: CodeBlock,
    Pattern: Pattern,
    MatchArm: MatchArm,
    attribute: attribute,
    field: field,
    struct: struct,
    enum_: enum_,
    enumVariant: enumVariant,
    newtypeStruct: newtypeStruct,
    method: method,
    standaloneFunction: standaloneFunction,
    implBlock: implBlock,
    module: module,
    client: client,
    docComment: docComment,
    writer: writer,
    visibility: {
        public: PUBLIC as Visibility,
        private: { type: "private" } as Visibility
    }
};

// Re-export all AST types and utilities
export * from "./ast";
