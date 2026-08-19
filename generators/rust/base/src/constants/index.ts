export const RUST_KEYWORDS = new Set([
    // Strict keywords
    "as",
    "break",
    "const",
    "continue",
    "crate",
    "else",
    "enum",
    "extern",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while",

    // Reserved keywords
    "abstract",
    "async",
    "await",
    "become",
    "box",
    "do",
    "dyn",
    "final",
    "macro",
    "override",
    "priv",
    "try",
    "typeof",
    "unsized",
    "virtual",
    "yield"
]);

/**
 * Static Rust source for the BuildError type used by generated builders.
 * Shared between model and SDK generators so the definition stays in sync.
 */
export const BUILD_ERROR_RS = `/// Error returned when a required field was not set on a builder.
#[derive(Debug)]
pub struct BuildError {
    field: &'static str,
}

impl BuildError {
    pub fn missing_field(field: &'static str) -> Self {
        Self { field }
    }
}

impl std::fmt::Display for BuildError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "\`{}\` was not set but is required", self.field)
    }
}

impl std::error::Error for BuildError {}
`;

export const RUST_RESERVED_TYPES = new Set([
    "Box",
    "Option",
    "Result",
    "Vec",
    "HashMap",
    "HashSet",
    "String",
    "str",
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "f32",
    "f64",
    "bool",
    "char",
    "usize",
    "isize"
]);
