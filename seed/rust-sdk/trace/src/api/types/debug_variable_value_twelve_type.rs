pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueTwelveType {
    #[serde(rename = "genericValue")]
    GenericValue,
}
impl fmt::Display for DebugVariableValueTwelveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::GenericValue => "genericValue",
        };
        write!(f, "{}", s)
    }
}
