pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesTree {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<TypesNode>>,
}
