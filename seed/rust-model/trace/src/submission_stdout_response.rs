pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StdoutResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub stdout: String,
}