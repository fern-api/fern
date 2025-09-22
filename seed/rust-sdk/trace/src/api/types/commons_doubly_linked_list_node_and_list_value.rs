use crate::commons_doubly_linked_list_value::DoublyLinkedListValue;
use crate::commons_node_id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DoublyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    #[serde(rename = "fullList")]
    pub full_list: DoublyLinkedListValue,
}
