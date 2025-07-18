export const RUST_KEYWORDS = new Set([
    // Strict keywords
    "as", "break", "const", "continue", "crate", "else", "enum", "extern",
    "false", "fn", "for", "if", "impl", "in", "let", "loop", "match",
    "mod", "move", "mut", "pub", "ref", "return", "self", "Self", "static",
    "struct", "super", "trait", "true", "type", "unsafe", "use", "where",
    "while",
    
    // Reserved keywords
    "abstract", "async", "await", "become", "box", "do", "dyn", "final",
    "macro", "override", "priv", "try", "typeof", "unsized", "virtual",
    "yield"
]);

export const RUST_RESERVED_TYPES = new Set([
    "Box", "Option", "Result", "Vec", "HashMap", "HashSet", "String",
    "str", "i8", "i16", "i32", "i64", "i128", "u8", "u16", "u32", "u64",
    "u128", "f32", "f64", "bool", "char", "usize", "isize"
]); 