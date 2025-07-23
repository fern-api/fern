use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum JsonLike {
        List(Vec<JsonLike>),

        Map(HashMap<String, JsonLike>),

        String(String),

        Integer(i32),

        Boolean(bool),
}

impl JsonLike {
    pub fn is_list(&self) -> bool {
        matches!(self, Self::List(_))
    }

    pub fn is_map(&self) -> bool {
        matches!(self, Self::Map(_))
    }

    pub fn is_string(&self) -> bool {
        matches!(self, Self::String(_))
    }

    pub fn is_integer(&self) -> bool {
        matches!(self, Self::Integer(_))
    }

    pub fn is_boolean(&self) -> bool {
        matches!(self, Self::Boolean(_))
    }


    pub fn as_list(&self) -> Option<&Vec<JsonLike>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_list(self) -> Option<Vec<JsonLike>> {
        match self {
                    Self::List(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_map(&self) -> Option<&HashMap<String, JsonLike>> {
        match self {
                    Self::Map(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_map(self) -> Option<HashMap<String, JsonLike>> {
        match self {
                    Self::Map(value) => Some(value),
                    _ => None,
                }
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

}
