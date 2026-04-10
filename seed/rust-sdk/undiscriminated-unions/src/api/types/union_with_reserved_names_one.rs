pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithReservedNamesOne {
    #[serde(rename = "value")]
    Value,
}
impl fmt::Display for UnionWithReservedNamesOne {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Value => "value",
        };
        write!(f, "{}", s)
    }
}
