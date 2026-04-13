pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithPrimitive {
        #[serde(rename = "integer")]
        #[non_exhaustive]
        Integer {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<i64>,
        },

        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },
}

impl UnionWithPrimitive {
    pub fn integer() -> Self {
        Self::Integer { value: None }
    }

    pub fn string() -> Self {
        Self::r#String { value: None }
    }

    pub fn integer_with_value(value: i64) -> Self {
        Self::Integer { value: Some(value) }
    }

    pub fn string_with_value(value: String) -> Self {
        Self::r#String { value: Some(value) }
    }
}
