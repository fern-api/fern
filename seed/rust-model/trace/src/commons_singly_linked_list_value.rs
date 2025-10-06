pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsSinglyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<CommonsNodeId>,
    pub nodes: HashMap<CommonsNodeId, CommonsSinglyLinkedListNodeValue>,
}