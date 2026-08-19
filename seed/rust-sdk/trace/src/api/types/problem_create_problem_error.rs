pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "_type")]
#[non_exhaustive]
pub enum CreateProblemError {
    #[serde(rename = "generic")]
    #[non_exhaustive]
    Generic {
        #[serde(default)]
        message: String,
        #[serde(default)]
        r#type: String,
        #[serde(default)]
        stacktrace: String,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl CreateProblemError {
    pub fn generic(message: String, r#type: String, stacktrace: String) -> Self {
        Self::Generic {
            message,
            r#type,
            stacktrace,
        }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
