pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionL2 {
    Boolean(bool),

    StringSet(HashSet<String>),

    StringList(Vec<String>),
}

impl NestedUnionL2 {
    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
    }

    pub fn is_stringset(&self) -> bool {
        matches!(self, Self::StringSet(_))
    }

    pub fn is_stringlist(&self) -> bool {
        matches!(self, Self::StringList(_))
    }

    pub fn as_boolean(&self) -> Option<&bool> {
        match self {
            Self::Boolean(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_boolean(self) -> Option<bool> {
        match self {
            Self::Boolean(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stringset(&self) -> Option<&HashSet<String>> {
        match self {
            Self::StringSet(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stringset(self) -> Option<HashSet<String>> {
        match self {
            Self::StringSet(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_stringlist(&self) -> Option<&Vec<String>> {
        match self {
            Self::StringList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_stringlist(self) -> Option<Vec<String>> {
        match self {
            Self::StringList(value) => Some(value),
            _ => None,
        }
    }
}
