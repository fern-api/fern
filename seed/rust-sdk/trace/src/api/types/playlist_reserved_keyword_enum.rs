pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PlaylistReservedKeywordEnum {
    #[serde(rename = "is")]
    Is,
    #[serde(rename = "as")]
    As,
}
impl fmt::Display for PlaylistReservedKeywordEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Is => "is",
            Self::As => "as",
        };
        write!(f, "{}", s)
    }
}
