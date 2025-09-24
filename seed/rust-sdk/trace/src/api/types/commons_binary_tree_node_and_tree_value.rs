use crate::commons_binary_tree_value::BinaryTreeValue;
use crate::commons_node_id::NodeId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinaryTreeNodeAndTreeValue {
    #[serde(rename = "nodeId")]
    pub node_id: NodeId,
    #[serde(rename = "fullTree")]
    pub full_tree: BinaryTreeValue,
}
