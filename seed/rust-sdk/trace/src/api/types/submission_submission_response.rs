pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionSubmissionResponse {
    ServerInitialized,

    ProblemInitialized {
        value: CommonsProblemId,
    },

    WorkspaceInitialized,

    ServerErrored {
        #[serde(flatten)]
        data: SubmissionExceptionInfo,
    },

    CodeExecutionUpdate {
        value: SubmissionCodeExecutionUpdate,
    },

    Terminated {
        #[serde(flatten)]
        data: SubmissionTerminatedResponse,
    },
}
