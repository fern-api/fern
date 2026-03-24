pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum JsonLike {
    JsonLikeList(Vec<JsonLike>),

    StringToJsonLikeMap(HashMap<String, JsonLike>),

    String(String),

    Integer(i64),

    Boolean(bool),
}

impl JsonLike {
    pub fn is_json_like_list(&self) -> bool {
        matches!(self, Self::JsonLikeList(_))
    }

    pub fn is_string_to_json_like_map(&self) -> bool {
        matches!(self, Self::StringToJsonLikeMap(_))
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

    pub fn as_json_like_list(&self) -> Option<&Vec<JsonLike>> {
        match self {
            Self::JsonLikeList(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_json_like_list(self) -> Option<Vec<JsonLike>> {
        match self {
            Self::JsonLikeList(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_string_to_json_like_map(&self) -> Option<&HashMap<String, JsonLike>> {
        match self {
            Self::StringToJsonLikeMap(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_string_to_json_like_map(self) -> Option<HashMap<String, JsonLike>> {
        match self {
            Self::StringToJsonLikeMap(value) => Some(value),
            _ => None,
        }
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
