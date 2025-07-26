use crate::submission_id::SubmissionId;
use crate::execution_session_status::ExecutionSessionStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct BuildingExecutorResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub status: ExecutionSessionStatus,
}