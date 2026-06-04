pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum ErrorInfo {
    #[serde(rename = "compileError")]
    #[non_exhaustive]
    CompileError {
        #[serde(default)]
        message: String,
    },

    #[serde(rename = "runtimeError")]
    #[non_exhaustive]
    RuntimeError {
        #[serde(default)]
        message: String,
    },

    #[serde(rename = "internalError")]
    #[non_exhaustive]
    InternalError {
        #[serde(rename = "exceptionInfo")]
        #[serde(default)]
        exception_info: ExceptionInfo,
    },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl ErrorInfo {
    pub fn compile_error(message: String) -> Self {
        Self::CompileError { message }
    }

    pub fn runtime_error(message: String) -> Self {
        Self::RuntimeError { message }
    }

    pub fn internal_error(exception_info: ExceptionInfo) -> Self {
        Self::InternalError { exception_info }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
