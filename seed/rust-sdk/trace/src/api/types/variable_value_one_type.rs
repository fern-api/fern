pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueOneType {
    #[serde(rename = "booleanValue")]
    BooleanValue,
}
impl fmt::Display for VariableValueOneType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BooleanValue => "booleanValue",
        };
        write!(f, "{}", s)
    }
}
