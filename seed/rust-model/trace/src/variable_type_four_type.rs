pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeFourType {
    #[serde(rename = "charType")]
    CharType,
}
impl fmt::Display for VariableTypeFourType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::CharType => "charType",
        };
        write!(f, "{}", s)
    }
}
