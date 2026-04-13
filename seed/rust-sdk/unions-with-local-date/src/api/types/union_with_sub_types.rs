pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithSubTypes {
    UnionWithSubTypesZero(UnionWithSubTypesZero),

    UnionWithSubTypesOne(UnionWithSubTypesOne),
}

impl UnionWithSubTypes {
    pub fn is_union_with_sub_types_zero(&self) -> bool {
        matches!(self, Self::UnionWithSubTypesZero(_))
    }

    pub fn is_union_with_sub_types_one(&self) -> bool {
        matches!(self, Self::UnionWithSubTypesOne(_))
    }

    pub fn as_union_with_sub_types_zero(&self) -> Option<&UnionWithSubTypesZero> {
        match self {
            Self::UnionWithSubTypesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_sub_types_zero(self) -> Option<UnionWithSubTypesZero> {
        match self {
            Self::UnionWithSubTypesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_with_sub_types_one(&self) -> Option<&UnionWithSubTypesOne> {
        match self {
            Self::UnionWithSubTypesOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_sub_types_one(self) -> Option<UnionWithSubTypesOne> {
        match self {
            Self::UnionWithSubTypesOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithSubTypes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithSubTypesZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithSubTypesOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
