use crate::node_id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BinaryTreeNodeValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<NodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<NodeId>,
}