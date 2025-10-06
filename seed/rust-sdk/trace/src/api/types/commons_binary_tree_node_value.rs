pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsBinaryTreeNodeValue {
    #[serde(rename = "nodeId")]
    pub node_id: CommonsNodeId,
    pub val: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub right: Option<CommonsNodeId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub left: Option<CommonsNodeId>,
}
