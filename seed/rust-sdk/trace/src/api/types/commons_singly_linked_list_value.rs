use crate::commons_node_id::NodeId;
use crate::commons_singly_linked_list_node_value::SinglyLinkedListNodeValue;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SinglyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    pub nodes: HashMap<NodeId, SinglyLinkedListNodeValue>,
}
