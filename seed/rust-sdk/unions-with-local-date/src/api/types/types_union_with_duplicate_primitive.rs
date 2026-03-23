pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicatePrimitive {
    #[serde(rename = "integer1")]
    #[non_exhaustive]
    Integer1 { value: i64 },

    #[serde(rename = "integer2")]
    #[non_exhaustive]
    Integer2 { value: i64 },

    #[serde(rename = "string1")]
    #[non_exhaustive]
    String1 { value: String },

    #[serde(rename = "string2")]
    #[non_exhaustive]
    String2 { value: String },
}

impl UnionWithDuplicatePrimitive {
    pub fn integer_1(value: i64) -> Self {
        Self::Integer1 { value }
    }

    pub fn integer_2(value: i64) -> Self {
        Self::Integer2 { value }
    }

    pub fn string_1(value: String) -> Self {
        Self::String1 { value }
    }

    pub fn string_2(value: String) -> Self {
        Self::String2 { value }
    }
}
