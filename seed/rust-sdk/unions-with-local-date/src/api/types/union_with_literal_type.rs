pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithLiteralType {
    #[serde(rename = "fern")]
    Fern,
}
impl fmt::Display for UnionWithLiteralType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Fern => "fern",
        };
        write!(f, "{}", s)
    }
}
