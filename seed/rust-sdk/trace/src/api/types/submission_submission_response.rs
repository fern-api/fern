pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum SubmissionResponse {
    #[serde(rename = "serverInitialized")]
    #[non_exhaustive]
    ServerInitialized {},

    #[serde(rename = "problemInitialized")]
    #[non_exhaustive]
    ProblemInitialized { value: ProblemId },

    #[serde(rename = "workspaceInitialized")]
    #[non_exhaustive]
    WorkspaceInitialized {},

    #[serde(rename = "serverErrored")]
    #[non_exhaustive]
    ServerErrored {
        #[serde(flatten)]
        data: ExceptionInfo,
    },

    #[serde(rename = "codeExecutionUpdate")]
    #[non_exhaustive]
    CodeExecutionUpdate { value: CodeExecutionUpdate },

    #[serde(rename = "terminated")]
    #[non_exhaustive]
    Terminated {},

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl SubmissionResponse {
    pub fn server_initialized() -> Self {
        Self::ServerInitialized {}
    }

    pub fn problem_initialized(value: ProblemId) -> Self {
        Self::ProblemInitialized { value }
    }

    pub fn workspace_initialized() -> Self {
        Self::WorkspaceInitialized {}
    }

    pub fn server_errored(data: ExceptionInfo) -> Self {
        Self::ServerErrored { data }
    }

    pub fn code_execution_update(value: CodeExecutionUpdate) -> Self {
        Self::CodeExecutionUpdate { value }
    }

    pub fn terminated() -> Self {
        Self::Terminated {}
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
