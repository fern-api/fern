use crate::problem_id::ProblemId;
use crate::exception_info::ExceptionInfo;
use crate::code_execution_update::CodeExecutionUpdate;
use crate::terminated_response::TerminatedResponse;
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
