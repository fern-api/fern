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
