pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}

impl Response {
    pub fn success(data: String, status: i64) -> Self {
        Self::Success { data, status }
    }

    pub fn error(error: String, code: i64) -> Self {
        Self::Error { error, code, details: None }
    }
}
