import {
    Type,
    Reference,
    Writer,
    AstNode,
    PrimitiveType,
    Attribute,
    Field,
    Struct,
    Enum,
    EnumVariant,
    NewtypeStruct,
    Visibility,
    PUBLIC
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

// Factory function for Writer creation
export function writer(): Writer {
    return new Writer();
}

// Convenience object for common patterns
export const rust = {
    Type,
    Reference,
    Attribute,
    Field,
    Struct,
    Enum,
    EnumVariant,
    NewtypeStruct,
    attribute,
    field,
    struct,
    enum_,
    enumVariant,
    newtypeStruct,
    writer,
    visibility: {
        public: PUBLIC as Visibility,
        private: { type: "private" } as Visibility
    }
};

// Re-export all AST types and utilities
export * from "./ast";
