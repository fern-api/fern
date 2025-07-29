use crate::node_id::NodeId;
use crate::doubly_linked_list_value::DoublyLinkedListValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DoublyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    #[serde(rename = "fullList")]
    pub full_list: DoublyLinkedListValue,
}