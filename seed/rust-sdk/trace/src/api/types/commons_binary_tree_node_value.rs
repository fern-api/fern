pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeNodeValue {
    #[serde(rename = "nodeId")]
    #[serde(default)]
    pub node_id: NodeId,
    #[serde(default)]
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<NodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<NodeId>,
}