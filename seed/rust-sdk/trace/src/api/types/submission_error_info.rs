pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
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
}
