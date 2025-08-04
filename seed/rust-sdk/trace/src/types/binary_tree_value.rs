use crate::node_id::NodeId;
use crate::binary_tree_node_value::BinaryTreeNodeValue;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<NodeId>,
    pub nodes: HashMap<NodeId, BinaryTreeNodeValue>,
}