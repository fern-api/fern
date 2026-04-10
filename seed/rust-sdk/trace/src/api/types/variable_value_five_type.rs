pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueFiveType {
    #[serde(rename = "mapValue")]
    MapValue,
}
impl fmt::Display for VariableValueFiveType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::MapValue => "mapValue",
        };
        write!(f, "{}", s)
    }
}
