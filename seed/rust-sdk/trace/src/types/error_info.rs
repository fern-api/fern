use crate::compile_error::CompileError;
use crate::runtime_error::RuntimeError;
use crate::internal_error::InternalError;
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
