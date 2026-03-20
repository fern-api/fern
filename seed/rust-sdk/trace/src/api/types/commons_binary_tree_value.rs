pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct BinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<NodeId>,
    #[serde(default)]
    pub nodes: HashMap<NodeId, BinaryTreeNodeValue>,
}