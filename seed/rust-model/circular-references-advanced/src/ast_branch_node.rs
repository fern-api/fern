pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AstBranchNode {
    pub children: Vec<AstNode>,
}