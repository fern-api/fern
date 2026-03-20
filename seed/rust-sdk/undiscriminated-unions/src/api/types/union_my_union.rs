pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MyUnion {
    String(String),

    StringList(Vec<String>),

    Integer(i64),

    IntegerList(Vec<i64>),

    List4(Vec<Vec<i64>>),

    StringSet(HashSet<String>),
}

impl MyUnion {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_stringlist(&self) -> bool {
        matches!(self, Self::StringList(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_integerlist(&self) -> bool {
        matches!(self, Self::IntegerList(_))
    }

    pub fn is_list4(&self) -> bool {
        matches!(self, Self::List4(_))
    }

    pub fn is_stringset(&self) -> bool {
        matches!(self, Self::StringSet(_))
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

    pub fn as_integer(&self) -> Option<&i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integer(self) -> Option<i64> {
        match self {
            Self::Integer(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_integerlist(&self) -> Option<&Vec<i64>> {
        match self {
            Self::IntegerList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integerlist(self) -> Option<Vec<i64>> {
        match self {
            Self::IntegerList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_list4(&self) -> Option<&Vec<Vec<i64>>> {
        match self {
            Self::List4(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_list4(self) -> Option<Vec<Vec<i64>>> {
        match self {
            Self::List4(value) => Some(value),
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
}
