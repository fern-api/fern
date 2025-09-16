use crate::commons_problem_id::ProblemId;
use crate::submission_code_execution_update::CodeExecutionUpdate;
use crate::submission_exception_info::ExceptionInfo;
use crate::submission_terminated_response::TerminatedResponse;
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
