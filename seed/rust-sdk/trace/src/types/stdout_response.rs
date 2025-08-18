use crate::submission_id::SubmissionId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StdoutResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub stdout: String,
}