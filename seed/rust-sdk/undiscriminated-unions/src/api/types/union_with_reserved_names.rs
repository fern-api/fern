pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithReservedNames {
    UnionWithReservedNamesZero(UnionWithReservedNamesZero),

    UnionWithReservedNamesOne(UnionWithReservedNamesOne),

    String(String),
}

impl UnionWithReservedNames {
    pub fn is_union_with_reserved_names_zero(&self) -> bool {
        matches!(self, Self::UnionWithReservedNamesZero(_))
    }

    pub fn is_union_with_reserved_names_one(&self) -> bool {
        matches!(self, Self::UnionWithReservedNamesOne(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn as_union_with_reserved_names_zero(&self) -> Option<&UnionWithReservedNamesZero> {
        match self {
            Self::UnionWithReservedNamesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_reserved_names_zero(self) -> Option<UnionWithReservedNamesZero> {
        match self {
            Self::UnionWithReservedNamesZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_with_reserved_names_one(&self) -> Option<&UnionWithReservedNamesOne> {
        match self {
            Self::UnionWithReservedNamesOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_reserved_names_one(self) -> Option<UnionWithReservedNamesOne> {
        match self {
            Self::UnionWithReservedNamesOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_string(&self) -> Option<&str> {
        match self {
            Self::String(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_string(self) -> Option<String> {
        match self {
            Self::String(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithReservedNames {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithReservedNamesZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithReservedNamesOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::String(value) => write!(f, "{}", value),
        }
    }
}
