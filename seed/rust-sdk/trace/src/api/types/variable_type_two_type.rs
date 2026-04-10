pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeTwoType {
    #[serde(rename = "booleanType")]
    BooleanType,
}
impl fmt::Display for VariableTypeTwoType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::BooleanType => "booleanType",
        };
        write!(f, "{}", s)
    }
}
