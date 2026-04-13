pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithoutKey {
    UnionWithoutKeyZero(UnionWithoutKeyZero),

    UnionWithoutKeyOne(UnionWithoutKeyOne),
}

impl UnionWithoutKey {
    pub fn is_union_without_key_zero(&self) -> bool {
        matches!(self, Self::UnionWithoutKeyZero(_))
    }

    pub fn is_union_without_key_one(&self) -> bool {
        matches!(self, Self::UnionWithoutKeyOne(_))
    }

    pub fn as_union_without_key_zero(&self) -> Option<&UnionWithoutKeyZero> {
        match self {
            Self::UnionWithoutKeyZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_without_key_zero(self) -> Option<UnionWithoutKeyZero> {
        match self {
            Self::UnionWithoutKeyZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_without_key_one(&self) -> Option<&UnionWithoutKeyOne> {
        match self {
            Self::UnionWithoutKeyOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_without_key_one(self) -> Option<UnionWithoutKeyOne> {
        match self {
            Self::UnionWithoutKeyOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithoutKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithoutKeyZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithoutKeyOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
