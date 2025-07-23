use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionL2 {
        Boolean(bool),

        Set(std::collections::HashSet<String>),

        List(Vec<String>),
}

impl NestedUnionL2 {
    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
    }

    pub fn is_set(&self) -> bool {
        matches!(self, Self::Set(_))
    }

    pub fn is_list(&self) -> bool {
        matches!(self, Self::List(_))
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

    pub fn as_set(&self) -> Option<&std::collections::HashSet<String>> {
        match self {
                    Self::Set(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_set(self) -> Option<std::collections::HashSet<String>> {
        match self {
                    Self::Set(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list(&self) -> Option<&Vec<String>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list(self) -> Option<Vec<String>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

}
