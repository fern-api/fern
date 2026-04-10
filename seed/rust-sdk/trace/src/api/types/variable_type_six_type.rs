pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeSixType {
    #[serde(rename = "mapType")]
    MapType,
}
impl fmt::Display for VariableTypeSixType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::MapType => "mapType",
        };
        write!(f, "{}", s)
    }
}
