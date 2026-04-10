pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum NestedUnionL2 {
        Boolean(bool),

        StringList(Vec<String>),
}

impl NestedUnionL2 {
    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
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
