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

    pub fn is_string_set(&self) -> bool {
        matches!(self, Self::StringSet(_))
    }

    pub fn is_string_list(&self) -> bool {
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
}
