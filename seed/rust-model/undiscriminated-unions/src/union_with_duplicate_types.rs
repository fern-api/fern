use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum UnionWithDuplicateTypes {
        String(String),

        List(Vec<String>),

        Integer(i32),

        Set(std::collections::HashSet<String>),
}

impl UnionWithDuplicateTypes {
    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_list(&self) -> bool {
        matches!(self, Self::List(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_set(&self) -> bool {
        matches!(self, Self::Set(_))
    }


    pub fn as_string(&self) -> Option<&String> {
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

    pub fn as_integer(&self) -> Option<&i32> {
        match self {
                    Self::Integer(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_integer(self) -> Option<i32> {
        match self {
                    Self::Integer(value) => Some(value),
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

}
