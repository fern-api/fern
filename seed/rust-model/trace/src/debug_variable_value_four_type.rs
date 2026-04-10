pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueFourType {
    #[serde(rename = "charValue")]
    CharValue,
}
impl fmt::Display for DebugVariableValueFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CharValue => "charValue",
        };
        write!(f, "{}", s)
    }
}
