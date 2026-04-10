pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum VariableTypeEightType {
    #[serde(rename = "singlyLinkedListType")]
    SinglyLinkedListType,
}
impl fmt::Display for VariableTypeEightType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::SinglyLinkedListType => "singlyLinkedListType",
        };
        write!(f, "{}", s)
    }
}
