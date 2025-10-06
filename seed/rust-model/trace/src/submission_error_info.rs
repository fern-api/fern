pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
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
