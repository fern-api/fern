pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeNineType {
    #[serde(rename = "doublyLinkedListType")]
    DoublyLinkedListType,
}
impl fmt::Display for VariableTypeNineType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DoublyLinkedListType => "doublyLinkedListType",
        };
        write!(f, "{}", s)
    }
}
