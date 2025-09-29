use crate::commons_binary_tree_node_value::BinaryTreeNodeValue;
use crate::commons_node_id::NodeId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<NodeId>,
    pub nodes: HashMap<NodeId, BinaryTreeNodeValue>,
}
