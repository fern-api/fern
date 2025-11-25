pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BranchNode {
    pub children: Vec<Box<Node>>,
}
