pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "event")]
pub enum StreamEvent {
    #[serde(rename = "completion")]
    #[non_exhaustive]
    Completion {
        #[serde(default)]
        content: String,
    },

    #[serde(rename = "error")]
    #[non_exhaustive]
    Error {
        #[serde(default)]
        error: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        code: Option<i64>,
    },
}

impl StreamEvent {
    pub fn completion(content: String) -> Self {
        Self::Completion { content }
    }

    pub fn error(error: String) -> Self {
        Self::Error { error, code: None }
    }

    pub fn error_with_code(error: String, code: i64) -> Self {
        Self::Error {
            error,
            code: Some(code),
        }
    }
}
