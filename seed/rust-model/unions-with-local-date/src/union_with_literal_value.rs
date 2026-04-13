pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithLiteralValue {
    #[serde(rename = "fern")]
    Fern,
}
impl fmt::Display for UnionWithLiteralValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Fern => "fern",
        };
        write!(f, "{}", s)
    }
}
