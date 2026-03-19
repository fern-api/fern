pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Node {
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<Box<Node>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trees: Option<Vec<Box<Tree>>>,
}