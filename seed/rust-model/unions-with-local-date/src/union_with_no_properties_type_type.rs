pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithNoPropertiesTypeType {
    #[serde(rename = "empty")]
    Empty,
}
impl fmt::Display for UnionWithNoPropertiesTypeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Empty => "empty",
        };
        write!(f, "{}", s)
    }
}
