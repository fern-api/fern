pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct SubmissionStopRequest {
    #[serde(rename = "submissionId")]
    pub submission_id: SubmissionSubmissionId,
}
