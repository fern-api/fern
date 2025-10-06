pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(tag = "type")]
pub enum SubmissionErrorInfo {
    CompileError {
        #[serde(flatten)]
        data: SubmissionCompileError,
    },

    RuntimeError {
        #[serde(flatten)]
        data: SubmissionRuntimeError,
    },

    InternalError {
        #[serde(flatten)]
        data: SubmissionInternalError,
    },
}
