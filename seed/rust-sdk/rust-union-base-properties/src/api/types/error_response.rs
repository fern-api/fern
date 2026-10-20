pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ErrorResponse {
    #[serde(rename = "processingError")]
    #[non_exhaustive]
    ProcessingError { message: String },

    #[serde(rename = "validationError")]
    #[non_exhaustive]
    ValidationError {
        #[serde(default)]
        field: String,
        message: String,
    },

    #[serde(rename = "timeoutError")]
    #[non_exhaustive]
    TimeoutError { message: String },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ErrorResponse {
    pub fn processing_error(message: String) -> Self {
        Self::ProcessingError { message }
    }

    pub fn validation_error(field: String, message: String) -> Self {
        Self::ValidationError { field, message }
    }

    pub fn timeout_error(message: String) -> Self {
        Self::TimeoutError { message }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }

    pub fn get_message(&self) -> &str {
        match self {
            Self::ProcessingError { message, .. } => message,
            Self::ValidationError { message, .. } => message,
            Self::TimeoutError { message, .. } => message,
            Self::__Unknown(_) => panic!(
                "get_message() called on __Unknown variant; inspect the raw JSON value directly"
            ),
        }
    }
}
