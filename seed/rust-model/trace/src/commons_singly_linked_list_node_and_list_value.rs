use crate::commons_node_id::NodeId;
use crate::commons_singly_linked_list_value::SinglyLinkedListValue;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SinglyLinkedListNodeAndListValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    #[serde(rename = "fullList")]
    pub full_list: SinglyLinkedListValue,
}