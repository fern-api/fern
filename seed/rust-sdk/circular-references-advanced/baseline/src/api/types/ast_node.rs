pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Node {
    BranchNode(Box<BranchNode>),

    LeafNode(LeafNode),
}

impl Node {
    pub fn is_branch_node(&self) -> bool {
        matches!(self, Self::BranchNode(_))
    }

    pub fn is_leaf_node(&self) -> bool {
        matches!(self, Self::LeafNode(_))
    }

    pub fn as_branch_node(&self) -> Option<&Box<BranchNode>> {
        match self {
            Self::BranchNode(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_branch_node(self) -> Option<BranchNode> {
        match self {
            Self::BranchNode(value) => Some(*value),
            _ => None,
        }
    }

    pub fn as_leaf_node(&self) -> Option<&LeafNode> {
        match self {
            Self::LeafNode(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_leaf_node(self) -> Option<LeafNode> {
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
