pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithDuplicateTypes {
    UnionWithDuplicateTypesZero(UnionWithDuplicateTypesZero),

    UnionWithDuplicateTypesOne(UnionWithDuplicateTypesOne),
}

impl UnionWithDuplicateTypes {
    pub fn is_union_with_duplicate_types_zero(&self) -> bool {
        matches!(self, Self::UnionWithDuplicateTypesZero(_))
    }

    pub fn is_union_with_duplicate_types_one(&self) -> bool {
        matches!(self, Self::UnionWithDuplicateTypesOne(_))
    }

    pub fn as_union_with_duplicate_types_zero(&self) -> Option<&UnionWithDuplicateTypesZero> {
        match self {
            Self::UnionWithDuplicateTypesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_duplicate_types_zero(self) -> Option<UnionWithDuplicateTypesZero> {
        match self {
            Self::UnionWithDuplicateTypesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_with_duplicate_types_one(&self) -> Option<&UnionWithDuplicateTypesOne> {
        match self {
            Self::UnionWithDuplicateTypesOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_duplicate_types_one(self) -> Option<UnionWithDuplicateTypesOne> {
        match self {
            Self::UnionWithDuplicateTypesOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithDuplicateTypes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithDuplicateTypesZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithDuplicateTypesOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
