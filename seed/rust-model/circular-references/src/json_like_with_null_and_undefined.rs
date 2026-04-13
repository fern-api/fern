pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum JsonLikeWithNullAndUndefined {
        JsonLikeWithNullAndUndefinedList(Vec<JsonLikeWithNullAndUndefined>),

        StringToJsonLikeWithNullAndUndefinedMap(HashMap<String, JsonLikeWithNullAndUndefined>),

        OptionalString(Option<String>),

        OptionalInteger(Option<i64>),

        OptionalBoolean(Option<bool>),
}

impl JsonLikeWithNullAndUndefined {
    pub fn is_json_like_with_null_and_undefined_list(&self) -> bool {
        matches!(self, Self::JsonLikeWithNullAndUndefinedList(_))
    }

    pub fn is_string_to_json_like_with_null_and_undefined_map(&self) -> bool {
        matches!(self, Self::StringToJsonLikeWithNullAndUndefinedMap(_))
    }

    pub fn is_optional_string(&self) -> bool {
        matches!(self, Self::OptionalString(_))
    }

    pub fn is_optional_integer(&self) -> bool {
        matches!(self, Self::OptionalInteger(_))
    }

    pub fn is_optional_boolean(&self) -> bool {
        matches!(self, Self::OptionalBoolean(_))
    }


    pub fn as_json_like_with_null_and_undefined_list(&self) -> Option<&Vec<JsonLikeWithNullAndUndefined>> {
        match self {
                    Self::JsonLikeWithNullAndUndefinedList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_json_like_with_null_and_undefined_list(self) -> Option<Vec<JsonLikeWithNullAndUndefined>> {
        match self {
                    Self::JsonLikeWithNullAndUndefinedList(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_string_to_json_like_with_null_and_undefined_map(&self) -> Option<&HashMap<String, JsonLikeWithNullAndUndefined>> {
        match self {
                    Self::StringToJsonLikeWithNullAndUndefinedMap(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_string_to_json_like_with_null_and_undefined_map(self) -> Option<HashMap<String, JsonLikeWithNullAndUndefined>> {
        match self {
                    Self::StringToJsonLikeWithNullAndUndefinedMap(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_optional_string(&self) -> Option<&str> {
        match self {
                    Self::OptionalString(value) => value.as_deref(),
                    _ => None,
                }
    }

    pub fn into_optional_string(self) -> Option<String> {
        match self {
                    Self::OptionalString(value) => value,
                    _ => None,
                }
    }

    pub fn as_optional_integer(&self) -> Option<&i64> {
        match self {
                    Self::OptionalInteger(value) => value.as_ref(),
                    _ => None,
                }
    }

    pub fn into_optional_integer(self) -> Option<i64> {
        match self {
                    Self::OptionalInteger(value) => value,
                    _ => None,
                }
    }

    pub fn as_optional_boolean(&self) -> Option<&bool> {
        match self {
                    Self::OptionalBoolean(value) => value.as_ref(),
                    _ => None,
                }
    }

    pub fn into_optional_boolean(self) -> Option<bool> {
        match self {
                    Self::OptionalBoolean(value) => value,
                    _ => None,
                }
    }
}
