pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum NestedObjectUnion {
    LeafTypeA(LeafTypeA),

    LeafTypeB(LeafTypeB),
}

impl NestedObjectUnion {
    pub fn is_leaf_type_a(&self) -> bool {
        matches!(self, Self::LeafTypeA(_))
    }

    pub fn is_leaf_type_b(&self) -> bool {
        matches!(self, Self::LeafTypeB(_))
    }

    pub fn as_leaf_type_a(&self) -> Option<&LeafTypeA> {
        match self {
            Self::LeafTypeA(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_leaf_type_a(self) -> Option<LeafTypeA> {
        match self {
            Self::LeafTypeA(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_leaf_type_b(&self) -> Option<&LeafTypeB> {
        match self {
            Self::LeafTypeB(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_leaf_type_b(self) -> Option<LeafTypeB> {
        match self {
            Self::LeafTypeB(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for NestedObjectUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::LeafTypeA(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::LeafTypeB(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
