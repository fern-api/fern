pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Node {
    BranchNode(BranchNode),

    LeafNode(LeafNode),
}

impl Node {
    pub fn is_branchnode(&self) -> bool {
        matches!(self, Self::BranchNode(_))
    }

    pub fn is_leafnode(&self) -> bool {
        matches!(self, Self::LeafNode(_))
    }

    pub fn as_branchnode(&self) -> Option<&BranchNode> {
        match self {
            Self::BranchNode(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_branchnode(self) -> Option<BranchNode> {
        match self {
            Self::BranchNode(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_leafnode(&self) -> Option<&LeafNode> {
        match self {
            Self::LeafNode(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_leafnode(self) -> Option<LeafNode> {
        match self {
            Self::LeafNode(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for Node {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BranchNode(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::LeafNode(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
