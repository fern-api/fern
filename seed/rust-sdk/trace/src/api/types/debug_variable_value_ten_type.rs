pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueTenType {
    #[serde(rename = "undefinedValue")]
    UndefinedValue,
}
impl fmt::Display for DebugVariableValueTenType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::UndefinedValue => "undefinedValue",
        };
        write!(f, "{}", s)
    }
}
