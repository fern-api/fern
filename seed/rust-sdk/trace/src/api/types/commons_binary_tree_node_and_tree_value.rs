pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeNodeAndTreeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(rename = "fullTree")]
    #[serde(default)]
    pub full_tree: BinaryTreeValue,
}
