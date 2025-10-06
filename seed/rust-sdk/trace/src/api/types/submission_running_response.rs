pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionRunningResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
    pub state: SubmissionRunningSubmissionState,
}
