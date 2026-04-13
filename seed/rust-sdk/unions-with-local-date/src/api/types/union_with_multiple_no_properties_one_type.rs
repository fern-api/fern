pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithMultipleNoPropertiesOneType {
    #[serde(rename = "empty1")]
    Empty1,
}
impl fmt::Display for UnionWithMultipleNoPropertiesOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Empty1 => "empty1",
        };
        write!(f, "{}", s)
    }
}
