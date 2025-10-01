use crate::commons_doubly_linked_list_node_value::DoublyLinkedListNodeValue;
use crate::commons_node_id::NodeId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoublyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    pub nodes: HashMap<NodeId, DoublyLinkedListNodeValue>,
}
