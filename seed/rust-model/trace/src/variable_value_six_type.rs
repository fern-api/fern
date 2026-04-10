pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueSixType {
    #[serde(rename = "listValue")]
    ListValue,
}
impl fmt::Display for VariableValueSixType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::ListValue => "listValue",
        };
        write!(f, "{}", s)
    }
}
