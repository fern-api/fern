pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsBinaryTreeNodeAndTreeValue {
    #[serde(rename = "nodeId")]
    pub node_id: CommonsNodeId,
    #[serde(rename = "fullTree")]
    pub full_tree: CommonsBinaryTreeValue,
}