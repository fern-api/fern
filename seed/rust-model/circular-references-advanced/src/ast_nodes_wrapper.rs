use crate::ast_node::Node;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodesWrapper {
    pub nodes: Vec<Vec<Node>>,
}