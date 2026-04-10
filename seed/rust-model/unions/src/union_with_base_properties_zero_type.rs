pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithBasePropertiesZeroType {
    #[serde(rename = "integer")]
    Integer,
}
impl fmt::Display for UnionWithBasePropertiesZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Integer => "integer",
        };
        write!(f, "{}", s)
    }
}
