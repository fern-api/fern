pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum UnionWithDuplicativeDiscriminants {
    UnionWithDuplicativeDiscriminantsZero(UnionWithDuplicativeDiscriminantsZero),

    UnionWithDuplicativeDiscriminantsOne(UnionWithDuplicativeDiscriminantsOne),
}

impl UnionWithDuplicativeDiscriminants {
    pub fn is_union_with_duplicative_discriminants_zero(&self) -> bool {
        matches!(self, Self::UnionWithDuplicativeDiscriminantsZero(_))
    }

    pub fn is_union_with_duplicative_discriminants_one(&self) -> bool {
        matches!(self, Self::UnionWithDuplicativeDiscriminantsOne(_))
    }

    pub fn as_union_with_duplicative_discriminants_zero(
        &self,
    ) -> Option<&UnionWithDuplicativeDiscriminantsZero> {
        match self {
            Self::UnionWithDuplicativeDiscriminantsZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_duplicative_discriminants_zero(
        self,
    ) -> Option<UnionWithDuplicativeDiscriminantsZero> {
        match self {
            Self::UnionWithDuplicativeDiscriminantsZero(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_union_with_duplicative_discriminants_one(
        &self,
    ) -> Option<&UnionWithDuplicativeDiscriminantsOne> {
        match self {
            Self::UnionWithDuplicativeDiscriminantsOne(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_union_with_duplicative_discriminants_one(
        self,
    ) -> Option<UnionWithDuplicativeDiscriminantsOne> {
        match self {
            Self::UnionWithDuplicativeDiscriminantsOne(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for UnionWithDuplicativeDiscriminants {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::UnionWithDuplicativeDiscriminantsZero(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::UnionWithDuplicativeDiscriminantsOne(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
