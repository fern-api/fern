pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueNineType {
    #[serde(rename = "doublyLinkedListNodeValue")]
    DoublyLinkedListNodeValue,
}
impl fmt::Display for DebugVariableValueNineType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::DoublyLinkedListNodeValue => "doublyLinkedListNodeValue",
        };
        write!(f, "{}", s)
    }
}
