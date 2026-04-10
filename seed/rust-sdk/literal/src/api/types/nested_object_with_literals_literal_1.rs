pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum NestedObjectWithLiteralsLiteral1 {
    #[serde(rename = "literal1")]
    Literal1,
}
impl fmt::Display for NestedObjectWithLiteralsLiteral1 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Literal1 => "literal1",
        };
        write!(f, "{}", s)
    }
}
