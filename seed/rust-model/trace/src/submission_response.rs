use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionResponse {
        ServerInitialized,

        ProblemInitialized {
            value: ProblemId,
        },

        WorkspaceInitialized,

        ServerErrored {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        CodeExecutionUpdate {
            value: CodeExecutionUpdate,
        },

        Terminated {
            #[serde(flatten)]
            data: TerminatedResponse,
        },
}
