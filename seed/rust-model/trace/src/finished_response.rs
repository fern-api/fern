use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FinishedResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
}