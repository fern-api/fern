use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct SubmissionIdNotFound {
    #[serde(rename = "missingSubmissionId")]
    pub missing_submission_id: SubmissionId,
}