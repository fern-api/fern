pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionKeyType {
    #[serde(rename = "name")]
    Name,
    #[serde(rename = "value")]
    Value,
}
impl fmt::Display for UnionKeyType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Name => "name",
            Self::Value => "value",
        };
        write!(f, "{}", s)
    }
}
