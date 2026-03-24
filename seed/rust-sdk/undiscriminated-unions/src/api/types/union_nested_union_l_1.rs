pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionL1 {
    Integer(i64),

    StringSet(HashSet<String>),

    StringList(Vec<String>),

    NestedUnionL2(NestedUnionL2),
}

impl NestedUnionL1 {
    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_string_set(&self) -> bool {
        matches!(self, Self::StringSet(_))
    }

    pub fn is_string_list(&self) -> bool {
        matches!(self, Self::StringList(_))
    }

    pub fn is_nested_union_l_2(&self) -> bool {
        matches!(self, Self::NestedUnionL2(_))
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

    pub fn as_nested_union_l_2(&self) -> Option<&NestedUnionL2> {
        match self {
            Self::NestedUnionL2(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_nested_union_l_2(self) -> Option<NestedUnionL2> {
        match self {
            Self::NestedUnionL2(value) => Some(value),
            _ => None,
        }
    }
}
