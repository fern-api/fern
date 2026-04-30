pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum AliasedObjectUnion {
    AliasedLeafA(AliasedLeafA),

    AliasedLeafB(AliasedLeafB),
}

impl AliasedObjectUnion {
    pub fn is_aliased_leaf_a(&self) -> bool {
        matches!(self, Self::AliasedLeafA(_))
    }

    pub fn is_aliased_leaf_b(&self) -> bool {
        matches!(self, Self::AliasedLeafB(_))
    }

    pub fn as_aliased_leaf_a(&self) -> Option<&AliasedLeafA> {
        match self {
            Self::AliasedLeafA(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_aliased_leaf_a(self) -> Option<AliasedLeafA> {
        match self {
            Self::AliasedLeafA(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_aliased_leaf_b(&self) -> Option<&AliasedLeafB> {
        match self {
            Self::AliasedLeafB(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_aliased_leaf_b(self) -> Option<AliasedLeafB> {
        match self {
            Self::AliasedLeafB(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for AliasedObjectUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::AliasedLeafA(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::AliasedLeafB(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
