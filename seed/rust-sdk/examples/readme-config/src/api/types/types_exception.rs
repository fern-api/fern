pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum Exception {
    #[serde(rename = "generic")]
    #[non_exhaustive]
    Generic {
        #[serde(rename = "exceptionType")]
        #[serde(default)]
        exception_type: String,
        #[serde(rename = "exceptionMessage")]
        #[serde(default)]
        exception_message: String,
        #[serde(rename = "exceptionStacktrace")]
        #[serde(default)]
        exception_stacktrace: String,
    },

    #[serde(rename = "timeout")]
    #[non_exhaustive]
    Timeout {},

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl Exception {
    pub fn generic(
        exception_type: String,
        exception_message: String,
        exception_stacktrace: String,
    ) -> Self {
        Self::Generic {
            exception_type,
            exception_message,
            exception_stacktrace,
        }
    }

    pub fn timeout() -> Self {
        Self::Timeout {}
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
