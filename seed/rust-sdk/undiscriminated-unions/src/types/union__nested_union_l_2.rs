use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NestedUnionL2 {
        Boolean(bool),

        Set1(std::collections::HashSet<String>),

        List2(Vec<String>),
}

impl NestedUnionL2 {
    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
    }

    pub fn is_set1(&self) -> bool {
        matches!(self, Self::Set1(_))
    }

    pub fn is_list2(&self) -> bool {
        matches!(self, Self::List2(_))
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

    pub fn as_set1(&self) -> Option<&std::collections::HashSet<String>> {
        match self {
                    Self::Set1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_set1(self) -> Option<std::collections::HashSet<String>> {
        match self {
                    Self::Set1(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_list2(&self) -> Option<&Vec<String>> {
        match self {
                    Self::List2(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list2(self) -> Option<Vec<String>> {
        match self {
                    Self::List2(value) => Some(value),
                    _ => None,
                }
    }

}
