pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueFiveType {
    #[serde(rename = "mapValue")]
    MapValue,
}
impl fmt::Display for DebugVariableValueFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::MapValue => "mapValue",
        };
        write!(f, "{}", s)
    }
}
