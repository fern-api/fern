pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum DebugVariableValueEightType {
    #[serde(rename = "singlyLinkedListNodeValue")]
    SinglyLinkedListNodeValue,
}
impl fmt::Display for DebugVariableValueEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SinglyLinkedListNodeValue => "singlyLinkedListNodeValue",
        };
        write!(f, "{}", s)
    }
}
