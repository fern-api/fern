pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueThreeType {
    #[serde(rename = "stringValue")]
    StringValue,
}
impl fmt::Display for DebugVariableValueThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::StringValue => "stringValue",
        };
        write!(f, "{}", s)
    }
}
