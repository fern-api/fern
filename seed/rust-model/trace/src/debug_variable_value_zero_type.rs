pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueZeroType {
    #[serde(rename = "integerValue")]
    IntegerValue,
}
impl fmt::Display for DebugVariableValueZeroType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::IntegerValue => "integerValue",
        };
        write!(f, "{}", s)
    }
}
