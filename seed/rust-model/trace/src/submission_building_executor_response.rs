use crate::submission_submission_id::SubmissionId;
use crate::submission_execution_session_status::ExecutionSessionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct BuildingExecutorResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub status: ExecutionSessionStatus,
}