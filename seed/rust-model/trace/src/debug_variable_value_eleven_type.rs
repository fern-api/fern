pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueElevenType {
    #[serde(rename = "nullValue")]
    NullValue,
}
impl fmt::Display for DebugVariableValueElevenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::NullValue => "nullValue",
        };
        write!(f, "{}", s)
    }
}
