use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StderrResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub stderr: String,
}