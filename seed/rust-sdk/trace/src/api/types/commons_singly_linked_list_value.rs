pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SinglyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    #[serde(default)]
    pub nodes: HashMap<NodeId, SinglyLinkedListNodeValue>,
}