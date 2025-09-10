use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<NodeId>,
    pub nodes: HashMap<NodeId, BinaryTreeNodeValue>,
}