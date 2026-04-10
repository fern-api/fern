pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueTwoType {
    #[serde(rename = "doubleValue")]
    DoubleValue,
}
impl fmt::Display for VariableValueTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DoubleValue => "doubleValue",
        };
        write!(f, "{}", s)
    }
}
