use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NodesWrapper {
    pub nodes: Vec<Vec<Node>>,
}