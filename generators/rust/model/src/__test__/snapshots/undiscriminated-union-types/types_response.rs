pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Response {
        #[serde(rename = "success")]
        #[non_exhaustive]
        Success {
            #[serde(default)]
            data: String,
            #[serde(default)]
            status: i64,
        },

        #[serde(rename = "error")]
        #[non_exhaustive]
        Error {
            #[serde(default)]
            error: String,
            #[serde(default)]
            code: i64,
            #[serde(skip_serializing_if = "Option::is_none")]
            details: Option<Vec<String>>,
        },

        /// Catch-all variant for unrecognized discriminant values.
        /// If the server sends a discriminant not recognized by the current SDK
        /// version, the raw payload is captured here so callers can still inspect it.
        #[serde(untagged)]
        __Unknown(serde_json::Value),
}

impl Response {
    pub fn success(data: String, status: i64) -> Self {
        Self::Success { data, status }
    }

    pub fn error(error: String, code: i64) -> Self {
        Self::Error { error, code, details: None }
    }

    pub fn error_with_details(error: String, code: i64, details: Vec<String>) -> Self {
        Self::Error { error, code, details: Some(details) }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
