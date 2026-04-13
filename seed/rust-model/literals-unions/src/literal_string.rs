pub use crate::prelude::*;

/// A string literal.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum LiteralString {
    #[serde(rename = "literally")]
    Literally,
}
impl fmt::Display for LiteralString {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Literally => "literally",
        };
        write!(f, "{}", s)
    }
}
