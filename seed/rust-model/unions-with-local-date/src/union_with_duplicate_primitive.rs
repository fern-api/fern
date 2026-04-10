pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum UnionWithDuplicatePrimitive {
        #[serde(rename = "integer1")]
        #[non_exhaustive]
        Integer1 {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<i64>,
        },

        #[serde(rename = "integer2")]
        #[non_exhaustive]
        Integer2 {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<i64>,
        },

        #[serde(rename = "string1")]
        #[non_exhaustive]
        String1 {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },

        #[serde(rename = "string2")]
        #[non_exhaustive]
        String2 {
            #[serde(skip_serializing_if = "Option::is_none")]
            value: Option<String>,
        },
}

impl UnionWithDuplicatePrimitive {
    pub fn integer1() -> Self {
        Self::Integer1 { value: None }
    }

    pub fn integer2() -> Self {
        Self::Integer2 { value: None }
    }

    pub fn string1() -> Self {
        Self::String1 { value: None }
    }

    pub fn string2() -> Self {
        Self::String2 { value: None }
    }

    pub fn integer1_with_value(value: i64) -> Self {
        Self::Integer1 { value: Some(value) }
    }

    pub fn integer2_with_value(value: i64) -> Self {
        Self::Integer2 { value: Some(value) }
    }

    pub fn string1_with_value(value: String) -> Self {
        Self::String1 { value: Some(value) }
    }

    pub fn string2_with_value(value: String) -> Self {
        Self::String2 { value: Some(value) }
    }
}
