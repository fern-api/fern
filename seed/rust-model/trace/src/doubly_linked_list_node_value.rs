use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DoublyLinkedListNodeValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev: Option<NodeId>,
}