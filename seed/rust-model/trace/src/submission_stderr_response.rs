pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct StderrResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub stderr: String,
}