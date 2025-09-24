use crate::commons_node_id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SinglyLinkedListNodeValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<NodeId>,
}
