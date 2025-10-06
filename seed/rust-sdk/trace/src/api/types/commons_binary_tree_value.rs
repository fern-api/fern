pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsBinaryTreeValue {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root: Option<CommonsNodeId>,
    pub nodes: HashMap<CommonsNodeId, CommonsBinaryTreeNodeValue>,
}
