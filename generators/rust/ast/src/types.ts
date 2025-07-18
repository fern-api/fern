export interface RustTypeOptions {
    isOptional?: boolean;
    isReference?: boolean;
    lifetime?: string;
}

export enum PrimitiveType {
    I8 = "i8",
    I16 = "i16",
    I32 = "i32",
    I64 = "i64",
    I128 = "i128",
    U8 = "u8",
    U16 = "u16",
    U32 = "u32",
    U64 = "u64",
    U128 = "u128",
    F32 = "f32",
    F64 = "f64",
    Bool = "bool",
    Char = "char",
    Str = "str",
    String = "String"
}

export interface Visibility {
    type: "public" | "pub_crate" | "pub_super" | "private";
}

export const PUBLIC: Visibility = { type: "public" };
export const PRIVATE: Visibility = { type: "private" };
