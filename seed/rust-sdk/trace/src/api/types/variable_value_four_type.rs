pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueFourType {
    #[serde(rename = "charValue")]
    CharValue,
}
impl fmt::Display for VariableValueFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CharValue => "charValue",
        };
        write!(f, "{}", s)
    }
}
