pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum AstNode {
        BranchNode(AstBranchNode),

        LeafNode(AstLeafNode),
}

impl AstNode {
    pub fn is_branchnode(&self) -> bool {
        matches!(self, Self::BranchNode(_))
    }

    pub fn is_leafnode(&self) -> bool {
        matches!(self, Self::LeafNode(_))
    }


    pub fn as_branchnode(&self) -> Option<&AstBranchNode> {
        match self {
                    Self::BranchNode(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_branchnode(self) -> Option<AstBranchNode> {
        match self {
                    Self::BranchNode(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_leafnode(&self) -> Option<&AstLeafNode> {
        match self {
                    Self::LeafNode(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_leafnode(self) -> Option<AstLeafNode> {
        match self {
                    Self::LeafNode(value) => Some(value),
                    _ => None,
                }
    }

}
