pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AstNodesWrapper {
    pub nodes: Vec<Vec<AstNode>>,
}