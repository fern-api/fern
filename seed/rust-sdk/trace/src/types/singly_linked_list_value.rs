use crate::node_id::NodeId;
use crate::singly_linked_list_node_value::SinglyLinkedListNodeValue;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SinglyLinkedListValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head: Option<NodeId>,
    pub nodes: HashMap<NodeId, SinglyLinkedListNodeValue>,
}