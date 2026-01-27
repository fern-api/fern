pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum SubmissionResponse {
        #[serde(rename = "serverInitialized")]
        ServerInitialized,

        #[serde(rename = "problemInitialized")]
        ProblemInitialized {
            value: ProblemId,
        },

        #[serde(rename = "workspaceInitialized")]
        WorkspaceInitialized,

        #[serde(rename = "serverErrored")]
        ServerErrored {
            #[serde(flatten)]
            data: ExceptionInfo,
        },

        #[serde(rename = "codeExecutionUpdate")]
        CodeExecutionUpdate {
            value: CodeExecutionUpdate,
        },

        #[serde(rename = "terminated")]
        Terminated {
            #[serde(flatten)]
            data: TerminatedResponse,
        },
}
