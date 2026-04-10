pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueEightType {
    #[serde(rename = "singlyLinkedListValue")]
    SinglyLinkedListValue,
}
impl fmt::Display for VariableValueEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SinglyLinkedListValue => "singlyLinkedListValue",
        };
        write!(f, "{}", s)
    }
}
