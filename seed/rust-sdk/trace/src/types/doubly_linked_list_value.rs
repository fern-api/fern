use crate::node_id::NodeId;
use crate::doubly_linked_list_node_value::DoublyLinkedListNodeValue;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DoublyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    pub nodes: HashMap<NodeId, DoublyLinkedListNodeValue>,
}