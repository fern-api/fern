pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum JsonLike {
    JsonLikeList(Vec<JsonLike>),

    Map1(HashMap<String, JsonLike>),

    String(String),

    Integer(i64),

    Boolean(bool),
}

impl JsonLike {
    pub fn is_jsonlikelist(&self) -> bool {
        matches!(self, Self::JsonLikeList(_))
    }

    pub fn is_map1(&self) -> bool {
        matches!(self, Self::Map1(_))
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

    pub fn as_jsonlikelist(&self) -> Option<&Vec<JsonLike>> {
        match self {
            Self::JsonLikeList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_jsonlikelist(self) -> Option<Vec<JsonLike>> {
        match self {
            Self::JsonLikeList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_map1(&self) -> Option<&HashMap<String, JsonLike>> {
        match self {
            Self::Map1(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_map1(self) -> Option<HashMap<String, JsonLike>> {
        match self {
            Self::Map1(value) => Some(value),
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
