pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum FlexibleValue {
        #[serde(rename = "string")]
        #[non_exhaustive]
        r#String {
            value: String,
        },

        #[serde(rename = "integer")]
        #[non_exhaustive]
        Integer {
            value: i64,
        },

        #[serde(rename = "double")]
        #[non_exhaustive]
        Double {
            value: f64,
        },

        #[serde(rename = "boolean")]
        #[non_exhaustive]
        Boolean {
            value: bool,
        },

        #[serde(rename = "stringList")]
        #[non_exhaustive]
        StringList {
            value: Vec<String>,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl FlexibleValue {
    pub fn string(value: String) -> Self {
        Self::r#String { value }
    }

    pub fn integer(value: i64) -> Self {
        Self::Integer { value }
    }

    pub fn double(value: f64) -> Self {
        Self::Double { value }
    }

    pub fn boolean(value: bool) -> Self {
        Self::Boolean { value }
    }

    pub fn string_list(value: Vec<String>) -> Self {
        Self::StringList { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
