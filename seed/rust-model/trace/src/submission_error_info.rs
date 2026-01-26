pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum ErrorInfo {
        #[serde(rename = "compileError")]
        CompileError {
            #[serde(flatten)]
            data: CompileError,
        },

        #[serde(rename = "runtimeError")]
        RuntimeError {
            #[serde(flatten)]
            data: RuntimeError,
        },

        #[serde(rename = "internalError")]
        InternalError {
            #[serde(flatten)]
            data: InternalError,
        },
}
