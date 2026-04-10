pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueThreeType {
    #[serde(rename = "stringValue")]
    StringValue,
}
impl fmt::Display for VariableValueThreeType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::StringValue => "stringValue",
        };
        write!(f, "{}", s)
    }
}
