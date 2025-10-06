pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TypesNode {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<TypesNode>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trees: Option<Vec<TypesTree>>,
}