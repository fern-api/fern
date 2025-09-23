use crate::submission_compile_error::CompileError;
use crate::submission_internal_error::InternalError;
use crate::submission_runtime_error::RuntimeError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum ErrorInfo {
    CompileError {
        #[serde(flatten)]
        data: CompileError,
    },

    RuntimeError {
        #[serde(flatten)]
        data: RuntimeError,
    },

    InternalError {
        #[serde(flatten)]
        data: InternalError,
    },
}
