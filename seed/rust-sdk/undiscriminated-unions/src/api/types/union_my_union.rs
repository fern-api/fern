pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MyUnion {
    String(String),

    StringList(Vec<String>),

    Integer(i64),

    IntegerList(Vec<i64>),

    IntegerListList(Vec<Vec<i64>>),

    StringSet(HashSet<String>),
}

impl MyUnion {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_string_list(&self) -> bool {
        matches!(self, Self::StringList(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_integer_list(&self) -> bool {
        matches!(self, Self::IntegerList(_))
    }

    pub fn is_integer_list_list(&self) -> bool {
        matches!(self, Self::IntegerListList(_))
    }

    pub fn is_string_set(&self) -> bool {
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

    pub fn as_string_list(&self) -> Option<&Vec<String>> {
        match self {
            Self::StringList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_string_list(self) -> Option<Vec<String>> {
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

    pub fn as_integer_list(&self) -> Option<&Vec<i64>> {
        match self {
            Self::IntegerList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integer_list(self) -> Option<Vec<i64>> {
        match self {
            Self::IntegerList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_integer_list_list(&self) -> Option<&Vec<Vec<i64>>> {
        match self {
            Self::IntegerListList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_integer_list_list(self) -> Option<Vec<Vec<i64>>> {
        match self {
            Self::IntegerListList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_string_set(&self) -> Option<&HashSet<String>> {
        match self {
            Self::StringSet(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_string_set(self) -> Option<HashSet<String>> {
        match self {
            Self::StringSet(value) => Some(value),
            _ => None,
        }
    }
}
