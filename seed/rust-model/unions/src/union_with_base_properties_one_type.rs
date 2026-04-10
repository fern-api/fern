pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithBasePropertiesOneType {
    #[serde(rename = "string")]
    String,
}
impl fmt::Display for UnionWithBasePropertiesOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::String => "string",
        };
        write!(f, "{}", s)
    }
}
