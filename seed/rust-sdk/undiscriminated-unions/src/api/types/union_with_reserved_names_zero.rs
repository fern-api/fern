pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithReservedNamesZero {
    #[serde(rename = "type")]
    Type,
}
impl fmt::Display for UnionWithReservedNamesZero {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Type => "type",
        };
        write!(f, "{}", s)
    }
}
