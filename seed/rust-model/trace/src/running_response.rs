use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RunningResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub state: RunningSubmissionState,
}