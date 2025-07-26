use serde::{Deserialize, Serialize};
use crate::node::Node;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Tree {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nodes: Option<Vec<Node>>,
}