pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableValueNineType {
    #[serde(rename = "doublyLinkedListValue")]
    DoublyLinkedListValue,
}
impl fmt::Display for VariableValueNineType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DoublyLinkedListValue => "doublyLinkedListValue",
        };
        write!(f, "{}", s)
    }
}
