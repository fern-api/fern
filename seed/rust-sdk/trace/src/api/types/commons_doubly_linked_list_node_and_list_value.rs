pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsDoublyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    pub node_id: CommonsNodeId,
    #[serde(rename = "fullList")]
    pub full_list: CommonsDoublyLinkedListValue,
}
