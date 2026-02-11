pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RunningResponse {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionId,
    pub state: RunningSubmissionState,
}