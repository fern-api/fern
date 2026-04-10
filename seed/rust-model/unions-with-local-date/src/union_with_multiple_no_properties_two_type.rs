pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum UnionWithMultipleNoPropertiesTwoType {
    #[serde(rename = "empty2")]
    Empty2,
}
impl fmt::Display for UnionWithMultipleNoPropertiesTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Empty2 => "empty2",
        };
        write!(f, "{}", s)
    }
}
