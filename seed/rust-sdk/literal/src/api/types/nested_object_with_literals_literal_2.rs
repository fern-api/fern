pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NestedObjectWithLiteralsLiteral2 {
    #[serde(rename = "literal2")]
    Literal2,
}
impl fmt::Display for NestedObjectWithLiteralsLiteral2 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Literal2 => "literal2",
        };
        write!(f, "{}", s)
    }
}
