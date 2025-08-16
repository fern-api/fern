use crate::submission_id::SubmissionId;
use crate::running_submission_state::RunningSubmissionState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RunningResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub state: RunningSubmissionState,
}