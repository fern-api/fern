pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeFiveType {
    #[serde(rename = "listType")]
    ListType,
}
impl fmt::Display for VariableTypeFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ListType => "listType",
        };
        write!(f, "{}", s)
    }
}
